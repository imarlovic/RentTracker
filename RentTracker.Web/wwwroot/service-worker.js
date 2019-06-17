importScripts("/precache-manifest.758d9c435578fdbdcddf3d7cd13530c5.js", "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");



/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

// importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

// importScripts(
//   "/precache-manifest.43a169a23db1809a7fd42492c85aa63a.js"
// );

// workbox.core.setCacheNameDetails({ prefix: "rent-tracker" });

// /**
//  * The workboxSW.precacheAndRoute() method efficiently caches and responds to
//  * requests for URLs in the manifest.
//  * See https://goo.gl/S9QRab
//  */

console.log('RentTracker service worker');

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

self.addEventListener('push', function (event) {

  if (event.data) {

    let json;
    let text;

    try {
      json = event.data.json()
    }
    catch {
      text = event.data.text()
    }

    let title = json ? json.title || "N/A" : "RentTracker";
    let body = json ? json.body || "N/A" : text;

    event.waitUntil(self.registration.showNotification(title, {
      body: body,
      icon: '/img/icons/favicon-32x32.png'
    }));
  }
});
