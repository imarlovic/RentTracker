using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PuppeteerSharp;
using RentTracker.Core.Entities;
using System;
using System.Collections.Generic;
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
    public class AirbnbIntegrationHelper
    {
        public static async Task<string> GetStateJsonAsync(IntegrationConfiguration config)
        {
            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);
            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            });

            var page = await browser.NewPageAsync();

            string key = null;
            CookieParam[] cookies = null;

            if (config.StateJson != null)
            {
                var existingState = JObject.Parse(config.StateJson);
                key = existingState["key"].ToObject<string>();
                cookies = existingState["Cookies"].ToObject<CookieParam[]>();
            }

            await page.GoToAsync("https://www.airbnb.com/hosting/reservations/upcoming");

            Request apiRequest = null;

            if (page.Url != "https://www.airbnb.com/hosting/reservations/upcoming")
            {
                var emailInput = await page.WaitForSelectorAsync("#signin_email");
                await emailInput.TypeAsync(config.Username);

                var passwordInput = await page.WaitForSelectorAsync("input#signin_password");
                await passwordInput.TypeAsync(config.Password);

                var rememberMeInput = await page.WaitForSelectorAsync("input#remember_me2");
                await rememberMeInput.ClickAsync();

                var submitButton = await page.WaitForSelectorAsync("form.login-form button[type=\"submit\"]");
                //navigationTask = page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = new[] { WaitUntilNavigation.Networkidle0 } });
                await submitButton.ClickAsync();
                //await navigationTask;

                apiRequest = await page.WaitForRequestAsync(r => r.Url.Contains("key="));

                var uri = new Uri(apiRequest.Url);
                var queryParameters = HttpUtility.ParseQueryString(uri.Query);

                key = queryParameters.Get("key");
            }

            var state = new
            {
                key,
                Cookies = await page.GetCookiesAsync(),
            };

            var stateJson = JsonConvert.SerializeObject(state);

            return stateJson;
        }
        public static string BuildCookieHeader(CookieParam[] cookies)
        {
            var transformedCookies = cookies.Select(c => $"{c.Name}={c.Value};");

            return string.Join(" ", transformedCookies);
        }
        public static async Task<IEnumerable<Reservation>> GetReservations(IntegrationConfiguration config)
        {
            var state = JsonConvert.DeserializeObject<JObject>(config.StateJson);

            var key = state.GetValue("key").ToObject<string>();
            var cookieParams = state.GetValue("Cookies").ToObject<CookieParam[]>();
            var cookies = BuildCookieHeader(cookieParams);

            var date_min = new DateTime(DateTime.Now.Year, 1, 1).ToString("yyy-MM-dd");
            var date_max = DateTime.Now.AddMonths(6).ToString("yyy-MM-dd");
            var limit = 40;
            var offset = 0;
            var page_index = 0;
            var page_count = 1;

            var reservations = new List<Reservation>();

            var client = new HttpClient();
            client.DefaultRequestHeaders.Host = "www.airbnb.com";
            client.DefaultRequestHeaders.Add("Cookie",HttpUtility.HtmlDecode(cookies));

            do
            {
                var reservationQueryUrl = $@"https://www.airbnb.com/api/v2/reservations?_format=for_remy&_limit={limit}&_offset={offset}&collection_strategy=for_reservations_list&currency=HRK&date_max={date_max}&date_min={date_min}&key={key}&locale=en&sort_field=start_date&sort_order=desc";

                var response = await client.GetAsync(reservationQueryUrl);

                if (response.StatusCode == HttpStatusCode.Unauthorized || response.StatusCode == HttpStatusCode.Forbidden)
                {
                    throw new AuthenticationException();
                }

                response.EnsureSuccessStatusCode();

                var jsonRaw = await response.Content.ReadAsStringAsync();
                dynamic json = JObject.Parse(jsonRaw);

                page_count = (int)json.metadata.page_count;

                foreach(var r in json.reservations)
                {
                    reservations.Add(ParseReservationJson(r));
                }

                page_index++;
                offset = page_index * limit;
            }
            while (page_index < page_count);


            return reservations;
        }
        private static Reservation ParseReservationJson(dynamic r)
        {
            var confirmation_code = (string)r.confirmation_code;
            var booked_by = (string)r.guest_user.full_name ?? (string)r.guest_user.first_name ?? "N/A";
            var check_in = (string)r.start_date;
            var check_out = (string)r.end_date;
            var booked_date = (string)r.booked_date;
            var status = (string)r.user_facing_status_localized;
            var earnings = (string)r.earnings;
            var adults = (int)r.guest_details.number_of_adults;
            var children = (int)r.guest_details.number_of_children;
            var infants = (int)r.guest_details.number_of_infants;
            var people = adults + children + infants;

            var formatProvider = CultureInfo.GetCultureInfo("en-US");

            var parsedReservation = new Reservation
            {
                Reference = confirmation_code,
                Source = Source.Airbnb,
                Currency = Currency.HRK,
                Price = decimal.Parse(earnings?.Replace("kn", "") ?? "0.0", formatProvider),
                Commission = 0.0m,
                StartDate = DateTime.ParseExact(check_in, "yyyy-MM-dd", formatProvider),
                EndDate = DateTime.ParseExact(check_out, "yyyy-MM-dd", formatProvider),
                BookingDate = DateTime.ParseExact(booked_date, "yyyy-MM-dd", formatProvider),
                HoldingName = booked_by,
                People = people,
                Adults = adults,
                Children = children,
                Infants = infants,
                State = status == "Confirmed" ? ReservationState.Active : ReservationState.Canceled
            };

            return parsedReservation;
        }
    }
}
