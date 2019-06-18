import actions from "./actions";
import mutations from "./mutations";

export default {
  namespaced: true,
  actions,
  mutations,
  state: {
    status: {
      apartment: {
        loading: false
      }
    },
    activeApartment: null,
    apartments: []
  }
}
