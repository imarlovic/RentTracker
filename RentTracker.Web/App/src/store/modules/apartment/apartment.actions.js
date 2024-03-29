import ApiFactory from "@/api/ApiFactory";

const ApartmentsApi = ApiFactory.get("apartments");

export default {
  /* Apartment */
  createOrUpdateApartment: (context, apartment) =>
    new Promise(async (resolve, reject) => {
      try {

        let result = apartment.id
          ? await ApartmentsApi.update(apartment)
          : await ApartmentsApi.create(apartment);

        resolve(result);
      } catch (e) {
        reject(e);
      }
    }),

  /* Reservation */
  getReservations: ({ commit }, apartmentId) =>
    new Promise(async (resolve, reject) => {
      try {
        let reservations = await ApartmentsApi.getReservations(apartmentId);
        commit("setReservations", reservations);
        resolve(reservations);
      } catch (e) {
        reject(e);
      }
    }),
  createOrUpdateReservation: ({ commit, rootState }, reservation) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        if (reservation.id) {
          reservation = await ApartmentsApi.updateReservation(apartmentId, reservation);
        } else {
          reservation = await ApartmentsApi.createReservation(apartmentId, reservation);
        }

        commit("createOrUpdateReservation", reservation);

        resolve(reservation);
      } catch (e) {
        reject(e);
      }
    }),
  deleteReservation: ({ commit, rootState }, reservationId) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        await ApartmentsApi.deleteReservation(apartmentId, reservationId);

        commit("deleteReservation", reservationId);

        resolve();
      } catch (e) {
        reject(e);
      }
    }),

  /* Linked Calendar */
  getLinkedCalendars: ({ commit, rootState }) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        let linkedCalendars = await ApartmentsApi.getLinkedCalendars(apartmentId);

        commit("setLinkedCalendars", linkedCalendars);

        resolve(linkedCalendars);
      } catch (e) {
        reject(e);
      }
    }),
  createOrUpdateLinkedCalendar: ({ commit, rootState }, linkedCalendar) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        if (linkedCalendar.id) {
          linkedCalendar = await ApartmentsApi.updateLinkedCalendar(apartmentId, linkedCalendar);
        } else {
          linkedCalendar = await ApartmentsApi.createLinkedCalendar(apartmentId, linkedCalendar);
        }

        commit("createOrUpdateLinkedCalendar", linkedCalendar);

        resolve(linkedCalendar);
      } catch (e) {
        reject(e);
      }
    }),
  deleteLinkedCalendar: ({ commit, rootState }, linkedCalendarId) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        await ApartmentsApi.deleteLinkedCalendar(apartmentId, linkedCalendarId);

        commit("deleteLinkedCalendar", linkedCalendarId);

        resolve();
      } catch (e) {
        reject(e);
      }
    }),
  syncLinkedCalendar: ({ rootState }, linkedCalendarId) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        await ApartmentsApi.syncLinkedCalendar(apartmentId, linkedCalendarId);

        resolve();
      } catch (e) {
        reject(e);
      }
    }),

  /* Expense */
  getExpenses: ({ commit, rootState }) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        let expenses = await ApartmentsApi.getExpenses(apartmentId);

        commit("setExpenses", expenses);

        resolve(expenses);
      } catch (e) {
        reject(e);
      }
    }),
  createOrUpdateExpense: ({ commit, rootState }, expense) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        if (expense.id) {
          expense = await ApartmentsApi.updateExpense(apartmentId, expense);
        } else {
          expense = await ApartmentsApi.createExpense(apartmentId, expense);
        }

        commit("createOrUpdateExpense", expense);

        resolve(expense);
      } catch (e) {
        reject(e);
      }
    }),
  deleteExpense: ({ commit, rootState }, expenseId) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        await ApartmentsApi.deleteExpense(apartmentId, expenseId);

        commit("deleteExpense", expenseId);

        resolve();
      } catch (e) {
        reject(e);
      }
    }),

  /* Document */
  getDocuments: ({ commit, rootState }) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        let entities = await ApartmentsApi.getDocuments(apartmentId);

        commit("setDocuments", entities);

        resolve(entities);
      } catch (e) {
        reject(e);
      }
    }),
  createOrUpdateDocument: ({ commit, rootState }, entity) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        if (entity.id) {
          entity = await ApartmentsApi.updateDocument(apartmentId, entity);
        } else {
          entity = await ApartmentsApi.createDocument(apartmentId, entity);
        }

        commit("createOrUpdateDocument", entity);

        resolve(entity);
      } catch (e) {
        reject(e);
      }
    }),
  deleteDocument: ({ commit, rootState }, id) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        await ApartmentsApi.deleteDocument(apartmentId, id);

        commit("deleteDocument", id);

        resolve();
      } catch (e) {
        reject(e);
      }
    }),

  /* Integration Configuration */
  getIntegrationConfigurations: ({ commit, rootState }) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        let result = await ApartmentsApi.getIntegrationConfigurations(apartmentId);

        commit("setIntegrationConfigurations", result);

        resolve(result);
      } catch (e) {
        reject(e);
      }
    }),
  createOrUpdateIntegrationConfiguration: ({ commit, rootState }, entity) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartmentId = rootState.global.activeApartment.id;

        if (entity.id) {
          entity = await ApartmentsApi.updateIntegrationConfiguration(apartmentId, entity);
        } else {
          entity = await ApartmentsApi.createIntegrationConfiguration(apartmentId, entity);
        }

        commit("createOrUpdateIntegrationConfiguration", entity);

        resolve(entity);
      } catch (e) {
        reject(e);
      }
    }),
  /* Booking.com */
  setupBookingIntegration: ({ commit, rootState }, pulseCode) => new Promise(async (resolve, reject) => {
    try {
      let apartmentId = rootState.global.activeApartment.id;

      let config = await ApartmentsApi.setupBookingIntegration(apartmentId, pulseCode);

      commit("createOrUpdateIntegrationConfiguration", config);

      resolve(config);
    } catch (e) {
      reject(e);
    }
  }),
  syncBookingReservations: ({ commit, rootState }) => new Promise(async (resolve, reject) => {
    try {
      let apartmentId = rootState.global.activeApartment.id;

      let config = await ApartmentsApi.syncBookingReservations(apartmentId);

      commit("createOrUpdateIntegrationConfiguration", config);

      resolve(config);
    } catch (e) {
      reject(e);
    }
  }),
  /* Airbnb */
  setupAirbnbIntegration: ({ commit, rootState }) => new Promise(async (resolve, reject) => {
    try {
      let apartmentId = rootState.global.activeApartment.id;

      let config = await ApartmentsApi.setupAirbnbIntegration(apartmentId);

      commit("createOrUpdateIntegrationConfiguration", config);

      resolve(config);
    } catch (e) {
      reject(e);
    }
  }),
  syncAirbnbReservations: ({ commit, rootState }) => new Promise(async (resolve, reject) => {
    try {
      let apartmentId = rootState.global.activeApartment.id;

      let config = await ApartmentsApi.syncAirbnbReservations(apartmentId);

      commit("createOrUpdateIntegrationConfiguration", config);

      resolve(config);
    } catch (e) {
      reject(e);
    }
  }),
};
