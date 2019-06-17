using ExcelDataReader;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PuppeteerSharp;
using RentTracker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;
using System.Web;

namespace RentTracker.Service.Utilities
{
    public class BookingIntegrationHelper
    {
        public static async Task<string> GetStateJsonAsync(IntegrationConfiguration config, string pulseCode = null)
        {
            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);
            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            });

            Task navigationTask;
            var page = await browser.NewPageAsync();

            if (config.StateJson != null)
            {
                var existingState = JObject.Parse(config.StateJson);
                var existingCookies = existingState["Cookies"].ToObject<CookieParam[]>();

                await page.SetCookieAsync(existingCookies);
            }

            await page.GoToAsync("https://admin.booking.com");

            await page.ScreenshotAsync(Path.Combine(Environment.CurrentDirectory, "screenshot.png"));

            var usernameInput = await page.WaitForSelectorAsync("input#loginname");
            await usernameInput.TypeAsync(config.PropertyId);
            await page.ClickAsync("form.nw-signin button[type=\"submit\"]");

            var passwordInput = await page.WaitForSelectorAsync("input#password");
            await passwordInput.TypeAsync(config.Password);

            var passwordSubmitButton = await page.WaitForSelectorAsync("form.nw-signin button[type=\"submit\"]");
            navigationTask = page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = new[] { WaitUntilNavigation.Networkidle0 } });
            await passwordSubmitButton.ClickAsync();
            await navigationTask;

            if(!page.Url.Contains("ses="))
            {
                if (pulseCode == null) return null;

                var pulseButton = await page.WaitForSelectorAsync("a.nw-pulse-verification-link");
                await pulseButton.ClickAsync();

                var pulseCodeInput = await page.WaitForSelectorAsync("input#sms_code");
                await pulseCodeInput.TypeAsync(pulseCode);

                var pulseCodeSubmitButton = await page.WaitForSelectorAsync("form.nw-tfa-form button[type=\"submit\"]");

                navigationTask = page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = new[] { WaitUntilNavigation.Networkidle0 } });
                await pulseCodeSubmitButton.ClickAsync();
                await navigationTask;
            }

            if (!page.Url.Contains("ses=")) return null;

            var uri = new Uri(page.Url);
            var queryParameters = HttpUtility.ParseQueryString(uri.Query);

            var ses = queryParameters.Get("ses");
            var cookies = await page.GetCookiesAsync();

            var state = new
            {
                ses,
                Cookies = cookies
            };

            var stateJson = JsonConvert.SerializeObject(state);

            return stateJson;
        }

        public static string BuildCookieHeader(CookieParam[] cookies)
        {
            var transformedCookies = cookies.Select(c => $"{c.Name}={c.Value};");

            return string.Join(" ", transformedCookies);
        }
        public static async Task<IEnumerable<Reservation>> GetReservations(IntegrationConfiguration config, DateTime? start = null, DateTime? end = null)
        {
            var state = JsonConvert.DeserializeObject<JObject>(config.StateJson);
            var ses = state.GetValue("ses").ToObject<string>();
            var cookieParams = state.GetValue("Cookies").ToObject<CookieParam[]>();
            var cookies = BuildCookieHeader(cookieParams);

            var date_from = start.HasValue ? start.Value.ToString("yyy-MM-dd") : new DateTime(DateTime.Now.Year, 1, 1).ToString("yyy-MM-dd");
            var date_to = end.HasValue ? end.Value.ToString("yyy-MM-dd") : DateTime.Now.AddMonths(6).ToString("yyy-MM-dd");

            var reservationQueryUrl = $@"https://admin.booking.com/fresa/extranet/reservations/download?date_type=arrival&date_to={date_to}&date_from={date_from}&lang=xu&hotel_id={config.PropertyId}&ses={ses}";

            var client = new HttpClient();
            client.DefaultRequestHeaders.Host = "admin.booking.com";
            client.DefaultRequestHeaders.Add("Cookie", cookies);

            var response = await client.GetAsync(reservationQueryUrl);

            if(response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.Forbidden)
            {
                throw new AuthenticationException();
            }

            response.EnsureSuccessStatusCode();

            var dataStream = await response.Content.ReadAsStreamAsync();

            return ParseRawReservationFileAsync(dataStream);
        }
        private static IEnumerable<Reservation> ParseRawReservationFileAsync(Stream dataStream)
        {
            var reservations = new List<Reservation>();

            using (var reader = ExcelReaderFactory.CreateReader(dataStream))
            {
                var result = reader.AsDataSet();

                var table = result.Tables[0];
                table.Rows.RemoveAt(0);

                foreach(var row in table.Rows.Cast<DataRow>())
                {
                    var booking_number = row.ItemArray[0] as double?;
                    var booked_by = row.ItemArray[1].ToString();
                    var guest_name = row.ItemArray[2].ToString();
                    var check_in = row.ItemArray[3].ToString();
                    var check_out = row.ItemArray[4].ToString();
                    var booked_on = row.ItemArray[5].ToString();
                    var status = row.ItemArray[6].ToString();
                    var people = row.ItemArray[8] as double?;
                    var adults = row.ItemArray[9] as double?;
                    var children = row.ItemArray[10] as double?;
                    var price = row.ItemArray[12].ToString();
                    var commission_amount = row.ItemArray[14].ToString();

                    if(!string.IsNullOrEmpty(booked_by) && booked_by.Contains(' '))
                    {
                        booked_by = booked_by.Replace(",", "");
                        booked_by = string.Join(" ", booked_by.Split(' ').Reverse());
                    }

                    var formatProvider = CultureInfo.GetCultureInfo("en-US");

                    var reservation = new Reservation
                    {
                        Reference = $"{booking_number}",
                        Source = Source.Booking,
                        Currency = Currency.EUR,
                        Price = !string.IsNullOrEmpty(price) ? decimal.Parse(price.Replace("EUR", ""), formatProvider) : 0.0m,
                        Commission = !string.IsNullOrEmpty(commission_amount) ? decimal.Parse(commission_amount.Replace("EUR", ""), formatProvider) : 0.0m,
                        StartDate = DateTime.ParseExact(check_in, "yyyy-MM-dd", formatProvider),
                        EndDate = DateTime.ParseExact(check_out, "yyyy-MM-dd", formatProvider),
                        BookingDate = DateTime.Parse(booked_on),
                        HoldingName = !string.IsNullOrEmpty(guest_name) ? guest_name : (!string.IsNullOrEmpty(booked_by) ? booked_by : "N/A"),
                        People = (int?)people.GetValueOrDefault(),
                        Adults = (int?)adults.GetValueOrDefault(),
                        Children = (int?)children.GetValueOrDefault(),
                        Infants = 0,
                        State = status == "ok" ? ReservationState.Active : ReservationState.Canceled
                    };

                    reservations.Add(reservation);
                }
            }

            return reservations;
        }
    }
}
