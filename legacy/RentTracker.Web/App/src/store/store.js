import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import global from "./modules/global/module";
import apartment from "./modules/apartment/apartment.module";
import reservation from "./modules/reservation/module";

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [
    createPersistedState({
      paths: ["global", "apartment"]
    })
  ],
  modules: {
    global,
    apartment,
    reservation
  },
  state: {},
  mutations: {},
  actions: {}
});

export default store