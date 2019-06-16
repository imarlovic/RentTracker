import "@/assets/css/tailwind.css";
import "@fortawesome/fontawesome-free/css/all.css";

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store";

Vue.config.productionTip = false;

import VueApexCharts from 'vue-apexcharts'
import './registerServiceWorker'

Vue.component('apexchart', VueApexCharts)

new Vue({
  router,
  store,
  render(h) {
    return h(App);
  }
}).$mount("#app");
