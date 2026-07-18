<template>
  <div class="app-view">
    <navigation-bar></navigation-bar>
    <div class="content-view">
      <router-view />
    </div>
  </div>
</template>
<script>
import NotificationsApi from "@/api/NotificationsApi";
import NavigationBar from "@/components/navigation/NavigationBar";

export default {
  name: "AppView",
  components: {
    NavigationBar
  },
  mounted() {
    if (!("serviceWorker" in navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      return;
    } else if (!("PushManager" in window)) {
      // Push isn't supported on this browser, disable or hide UI.
      return;
    } else {
      this.registerUpdateNotification();
      this.subscribeForPushNotifications();
    }
  },
  methods: {
    urlB64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
    async subscribeForPushNotifications() {
      const serviceWorker = await navigator.serviceWorker.ready;
      if (!serviceWorker) return;

      const permissionResult = await Notification.requestPermission();
      if (permissionResult != "granted") return;

      let existingSubscription = await serviceWorker.pushManager.getSubscription();

      if (!existingSubscription) {
        let applicationServerPublicKey = await NotificationsApi.getPublicKey();

        console.log(applicationServerPublicKey);

        if (!applicationServerPublicKey) {
          console.log("Failed to retrieve application server public key");
          return;
        }

        try {
          const pushSubscription = await serviceWorker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlB64ToUint8Array(
              applicationServerPublicKey
            )
          });

          let pushSubscriptionJson = pushSubscription.toJSON();

          let subscription = {
            endpoint: pushSubscription.endpoint,
            p256dh: pushSubscriptionJson.keys.p256dh,
            auth: pushSubscriptionJson.keys.auth
          };

          await NotificationsApi.subscribe(subscription);
        } catch (e) {
          console.log("Failed to subscribe the user for push notifications", e);
        }
      }
    },
    async registerUpdateNotification() {
      // const serviceWorker = await navigator.serviceWorker.ready;
      // // Add an event listener to detect when the registered
      // // service worker has installed but is waiting to activate.
      // serviceWorker.addEventListener("waiting", event => {
      //   // `event.wasWaitingBeforeRegister` will be false if this is
      //   // the first time the updated service worker is waiting.
      //   // When `event.wasWaitingBeforeRegister` is true, a previously
      //   // updated same service worker is still waiting.
      //   // You may want to customize the UI prompt accordingly.
      //   // Assumes your app has some sort of prompt UI element
      //   // that a user can either accept or reject.
      //   const prompt = createUIPrompt({
      //     onAccept: async () => {
      //       // Assuming the user accepted the update, set up a listener
      //       // that will reload the page as soon as the previously waiting
      //       // service worker has taken control.
      //       serviceWorker.addEventListener("controlling", event => {
      //         window.location.reload();
      //       });
      //       // Send a message telling the service worker to skip waiting.
      //       // This will trigger the `controlling` event handler above.
      //       // Note: for this to work, you have to add a message
      //       // listener in your service worker. See below.
      //       serviceWorker.messageSW({ type: "SKIP_WAITING" });
      //     },
      //     onReject: () => {
      //       prompt.dismiss();
      //     }
      //   });
      // });
      // wb.register();
    },
    async updateApp() {}
  }
};
</script>
<style scoped>
.content-view {
  max-height: calc(100vh - 62px);
  min-height: calc(100vh - 62px);
  overflow: auto;
}
</style>
