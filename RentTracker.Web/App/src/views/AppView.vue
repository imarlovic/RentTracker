<template>
  <div class="app-view">
    <navigation-bar></navigation-bar>
    <router-view />
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
    this.subscribeForPushNotifications();
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
      let applicationServerPublicKey;
      let existingSubscription;

      navigator.serviceWorker.ready.then(async serviceWorker => {
        existingSubscription = await serviceWorker.pushManager.getSubscription();

        if (!existingSubscription) {
          applicationServerPublicKey = await NotificationsApi.getPublicKey();

          console.log(applicationServerPublicKey);

          if (!applicationServerPublicKey) {
            console.log("Failed to retrieve application server public key");
            return;
          }

          serviceWorker.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlB64ToUint8Array(
                applicationServerPublicKey
              )
            })
            .then(pushSubscription => {
              let pushSubscriptionJson = pushSubscription.toJSON();

              let subscription = {
                endpoint: pushSubscription.endpoint,
                p256dh: pushSubscriptionJson.keys.p256dh,
                auth: pushSubscriptionJson.keys.auth
              };

              NotificationsApi.subscribe(subscription);
            })
            .catch(e => {
              console.log(e);
            });
        }
      });
    }
  }
};
</script>
