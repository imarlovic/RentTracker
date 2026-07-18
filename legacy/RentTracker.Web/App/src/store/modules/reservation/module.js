import actions from "./actions";
import mutations from "./mutations";
import getters from "./getters";

export default {
  namespaced: true,
  getters,
  actions,
  mutations,
  state: {
    reservations: []
  }
};
