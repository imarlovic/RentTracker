using IdentityServer4;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RentTracker.Core.Interfaces;
using RentTracker.Data;
using RentTracker.Data.Initialization;
using RentTracker.Data.Interfaces;
using RentTracker.Service;
using RentTracker.Web.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography.X509Certificates;
using WebPush;

namespace RentTracker.Web
{
    public class Startup
    {
        public IHostingEnvironment Environment { get; }
        public VapidDetails VapidDetails { get; }
        public Startup(IHostingEnvironment environment, IConfiguration configuration)
        {
            Environment = environment;
            Configuration = configuration;

            var vapidDetailsSection = Configuration.GetSection("VapidDetails");

            VapidDetails = new VapidDetails
            {
                Subject = vapidDetailsSection.GetValue<string>("subject"),
                PrivateKey = vapidDetailsSection.GetValue<string>("privateKey"),
                PublicKey = vapidDetailsSection.GetValue<string>("publicKey"),
            };
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var dbConnectionString = Configuration.GetConnectionString("DB");
            var authority = Configuration.GetSection("Authentication")?.GetValue<string>("authority");

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                });

            #region IdentityServer configuration

            var builder = services.AddIdentityServer(options =>
            {
                options.UserInteraction.LoginUrl = "/auth/login";
            })
            .AddInMemoryIdentityResources(Config.GetIdentityResources())
            .AddInMemoryApiResources(Config.GetApis())
            .AddInMemoryClients(Config.GetClients())
            .AddProfileService<UserProfileService>();

            if (Environment.IsDevelopment())
            {
                builder.AddDeveloperSigningCredential();
            }
            else
            {
                X509Store store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
                store.Open(OpenFlags.ReadOnly);
                X509Certificate2 cert = null;

                foreach (X509Certificate2 certificate in store.Certificates)
                {
                    if (!string.IsNullOrWhiteSpace(certificate?.SubjectName?.Name) && certificate.SubjectName.Name.StartsWith("CN=renttracker.duckdns.org"))
                    {
                        cert = certificate;
                        break;
                    }
                }

                if (cert == null) throw new Exception("Certificate not found!");

                builder.AddSigningCredential(cert);
            }

            #endregion

            #region Authentication configuration

            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "Cookies";
                options.DefaultChallengeScheme = "oidc";
            })
            .AddCookie("Cookies")
            .AddOpenIdConnect("oidc", options =>
            {
                options.SignInScheme = "Cookies";

                options.Authority = authority;
                options.RequireHttpsMetadata = false;

                options.ClientId = "mvc";
                options.ClientSecret = "secret";
                options.ResponseType = "code id_token";

                options.SaveTokens = true;
                options.GetClaimsFromUserInfoEndpoint = true;

                options.Scope.Add("api1");
                options.Scope.Add(IdentityServerConstants.StandardScopes.OfflineAccess);
            })
            .AddGoogle("Google", options =>
            {
                options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;
                options.ClientId = "658207955903-gh23kfhhir9s6u6tsn5rqnkqsck12pss.apps.googleusercontent.com";
                options.ClientSecret = "LpPZfB9z64AcEidGeSZnb5GM";
            });

            #endregion

            #region Dependency Injection Configuration
            services.AddDbContext<RentTrackerContext>(options => options.UseSqlServer(dbConnectionString));

            services.AddSingleton(VapidDetails);
            services.AddSingleton<IPushNotificationsQueue, PushNotificationsQueue>();

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<ILinkedCalendarService, LinkedCalendarService>();
            services.AddScoped<IApartmentService, ApartmentService>();
            services.AddScoped<IIntegrationConfigurationService, IntegrationConfigurationService>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<IPushNotificationService, PushNotificationService>();
            services.AddScoped<IUserStore, UserStore>();

            #endregion

            #region Hosted services configuration

            services.AddHostedService<CalendarSyncService>();
            services.AddHostedService<IntegrationSyncService>();
            services.AddHostedService<PushNotificationSenderService>();

            #endregion
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IUnitOfWork unitOfWork)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                var dbInitializer = new TestDatabaseInitialization(unitOfWork);

                dbInitializer.PerformInitialization().GetAwaiter().GetResult();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                //app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseIdentityServer();
            app.UseAuthentication();

            app.UseStaticFiles();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute("spa-fallback", new { controller = "Home", action = "Index" });
            });
        }
    }
}
