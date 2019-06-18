import merge from 'lodash.merge'

export default {
  setActiveApartment(state, apartment) {
    state.activeApartment = apartment || null;
  },
  setApartments(state, apartments) {
    state.apartments = apartments || [];
  },
  updateStatus(state, status) {
    if (status) state.status = merge(state.status, status)
  }
};
