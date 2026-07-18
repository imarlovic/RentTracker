import actions from "./apartment.actions";
import mutations from "./apartment.mutations";
import getters from "./apartment.getters";

export default {
  namespaced: true,
  actions,
  mutations,
  getters,
  state: {
    status: {
      linkedCalendar: {
        loading: false,
        syncing: false
      },
      expense: {
        loading: false
      },
      document: {
        loading: false,
      },
      reservation: {
        loading: false
      },
      integrationConfiguration: {
        loading: false,
      }
    },


    linkedCalendars: [],
    expenses: [],
    documents: [],
    reservations: [],

    airbnbIntegrationConfiguration: null,
    bookingIntegrationConfiguration: null
  }
};
