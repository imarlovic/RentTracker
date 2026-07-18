using Microsoft.VisualStudio.TestTools.UnitTesting;
using PuppeteerSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace RentTracker.Test
{
    [TestClass]
    public class BookingScrapperTest
    {
        [TestMethod]
        public async Task Execute()
        {
            var cookies = await Scrape();

            await Scrape(cookies);

        }

        [TestMethod]
        public async Task<CookieParam[]> Scrape(CookieParam[] cookies = null)
        {

            var screenshotFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "screenshot.png");

            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);
            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            });

            Task navigationTask;
            var page = await browser.NewPageAsync();

            if(cookies != null)
            {
                foreach (var cookie in cookies)
                {
                    await page.SetCookieAsync(cookie);
                }
            }

            await page.GoToAsync("https://admin.booking.com");

            await page.ScreenshotAsync(screenshotFilePath);

            await page.Keyboard.TypeAsync("2453996");
            await page.ClickAsync("form.nw-signin button[type=\"submit\"]");

            var passwordInput = await page.WaitForSelectorAsync("input#password");
            await passwordInput.TypeAsync("booking-johnnyx1A");

            var passwordSubmitButton = await page.WaitForSelectorAsync("form.nw-signin button[type=\"submit\"]");

            navigationTask = page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = new[] { WaitUntilNavigation.Networkidle0 } });
            await passwordSubmitButton.ClickAsync();
            await navigationTask;

            await page.ScreenshotAsync(screenshotFilePath);

            if(page.Url.Contains("ses="))
            {
                return new CookieParam[2];
            }
            else
            {
                var pulseButton = await page.WaitForSelectorAsync("a.nw-pulse-verification-link");
                await pulseButton.ClickAsync();

                var pulseCodeInput = await page.WaitForSelectorAsync("input#sms_code");
                await pulseCodeInput.TypeAsync("706860");

                await page.ScreenshotAsync(screenshotFilePath);

                var pulseCodeSubmitButton = await page.WaitForSelectorAsync("form.nw-tfa-form button[type=\"submit\"]");

                navigationTask = page.WaitForNavigationAsync(new NavigationOptions { WaitUntil = new[] { WaitUntilNavigation.Networkidle0 } });
                await pulseCodeSubmitButton.ClickAsync();

                await navigationTask;

                await page.ScreenshotAsync(screenshotFilePath);

                return await page.GetCookiesAsync();
            }
            
        }

        [TestMethod]
        public async Task DownloadReservations()
        {
            var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "reservations.xls");

            var client = new HttpClient();
            client.DefaultRequestHeaders.Host = "admin.booking.com";
            client.DefaultRequestHeaders.Add("Cookie", "esadm=02UmFuZG9tSVYkc2RlIyh9YbxZGyl9Y5%2BPynjCLxCQ5SnKFbrr57DvXZw1sp2yFYUddAZCaighbCs%3D; ecid=WItRz%2BR36BGkGg028uL7CQan; bkng_bfp=aef6b2e1b76f06aacb6f0c2b8f99a513; auth_token=6412390550; ux=e; hauavc=01be565IQWtYpsK1NdHtF%2BjRchlkDi%2FoOolSuOOJywu2bUemY0; bkng_bfp=86f162fcd73527f33dc06228d1d588a0; external_host=account.booking.com; xp=02UmFuZG9tSVYkc2RlIyh9YbxZGyl9Y5%2BPpjNyy1T7WUQFoQgXZsIpfhJITCOuSk2SV8Ljk3HCReM%3D; liteha=%5B%7B%22actions%22%3A%5B%5D%2C%22page%22%3A%22home%22%7D%2C%7B%22actions%22%3A%5B%5D%2C%22page%22%3A%22finance_reservations%22%7D%2C%7B%22actions%22%3A%5B%5D%2C%22page%22%3A%22search_reservations%22%7D%5D; bkng_iam_rt=CAESQlJAKiYcMd1HOoS9iVxT8CQ0oRWVsb4cqGtRVYwapJXGqcQvKA824B18ua8LSvtXsG0V5U3sUlr95FYOhPcqZ_cHCw; he=02UmFuZG9tSVYkc2RlIyh9YbxZGyl9Y5%2BPMzBUOmE1%2BZnRjE6ccsHLcr3XeaLhlmueT7Ji33TyEzQ%3D");

            var data = await client.GetByteArrayAsync(@"https://admin.booking.com/fresa/extranet/reservations/download?date_type=arrival&date_to=2019-01-10&date_from=2019-12-31&lang=xu&hotel_id=2453996&ses=4e1e6fd18bafca6079649931b72438c6");

            File.WriteAllBytes(filePath, data);
        }
    }
}
