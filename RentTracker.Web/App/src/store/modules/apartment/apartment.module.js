import actions from "./apartment.actions";
import mutations from "./apartment.mutations";
import getters from "./apartment.getters";

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state: {
    linkedCalendars: [],
    expenses: [],
    documents: [],
    reservations: [],

    airbnbIntegrationConfiguration: null,
    bookingIntegrationConfiguration: null
  }
};
