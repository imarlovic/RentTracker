import Api from "./Api";

export default {
  async create(apartment) {
    const response = await Api.post(`/apartments`, apartment);
    return response.data;
  },
  async update(apartment) {
    const response = await Api.put(`/apartments/${apartment.id}`, apartment);
    return response.data;
  },
  async get() {
    const response = await Api.get(`/apartments`);
    return response.data;
  },

  /* Reservation */
  async getReservations(apartmentId) {
    const response = await Api.get(`/apartments/${apartmentId}/reservations`);
    return response.data;
  },
  async createReservation(apartmentId, data) {
    const response = await Api.post(`/apartments/${apartmentId}/reservations`, data);

    return response.data;
  },
  async updateReservation(apartmentId, data) {
    const response = await Api.put(
      `/apartments/${apartmentId}/reservations/${data.id}`,
      data
    );

    return response.data;
  },
  async deleteReservation(apartmentId, reservationId) {
    const response = await Api.delete(
      `/apartments/${apartmentId}/reservations/${reservationId}`
    );

    return response.data;
  },

  /* Expense */
  async getExpenses(apartmentId) {
    const response = await Api.get(`/apartments/${apartmentId}/expenses`);
    return response.data;
  },
  async createExpense(apartmentId, data) {
    const response = await Api.post(`/apartments/${apartmentId}/expenses`, data);

    return response.data;
  },
  async updateExpense(apartmentId, data) {
    const response = await Api.put(
      `/apartments/${apartmentId}/expenses/${data.id}`,
      data
    );

    return response.data;
  },
  async deleteExpense(apartmentId, expenseId) {
    const response = await Api.delete(
      `/apartments/${apartmentId}/expenses/${expenseId}`
    );

    return response.data;
  },

  /* Document */
  async getDocuments(apartmentId) {
    const response = await Api.get(`/apartments/${apartmentId}/documents`);
    return response.data;
  },
  async createDocument(apartmentId, data) {

    let fd = new FormData();
    fd.append("title", data.title);

    if (data.file) fd.append("file", data.file)

    const response = await Api.post(`/apartments/${apartmentId}/documents`, fd, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
  },
  async updateDocument(apartmentId, data) {

    let fd = new FormData();
    fd.append("title", data.title);

    if (data.file) fd.append("file", data.file)

    const response = await Api.put(
      `/apartments/${apartmentId}/documents/${data.id}`,
      fd, {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    return response.data;
  },
  async deleteDocument(apartmentId, documentId) {
    const response = await Api.delete(
      `/apartments/${apartmentId}/documents/${documentId}`
    );

    return response.data;
  },

  /* Linked calendar */
  async getLinkedCalendars(apartmentId) {
    const response = await Api.get(`/apartments/${apartmentId}/linked-calendars`);
    return response.data;
  },
  async createLinkedCalendar(apartmentId, data) {
    const response = await Api.post(`/apartments/${apartmentId}/linked-calendars`, data);

    return response.data;
  },
  async updateLinkedCalendar(apartmentId, linkedCalendar) {
    const response = await Api.put(
      `/apartments/${apartmentId}/linked-calendars/${linkedCalendar.id}`,
      linkedCalendar
    );

    return response.data;
  },
  async deleteLinkedCalendar(apartmentId, linkedCalendarId) {
    const response = await Api.delete(
      `/apartments/${apartmentId}/linked-calendars/${linkedCalendarId}`
    );

    return response.data;
  },
  async syncLinkedCalendar(apartmentId, linkedCalendarId) {
    const response = await Api.post(
      `/apartments/${apartmentId}/linked-calendars/${linkedCalendarId}/sync`
    );

    return response.data;
  },

  /* Integration Configuration */
  async getIntegrationConfigurations(apartmentId) {
    const response = await Api.get(`/apartments/${apartmentId}/integration-configurations`);
    return response.data;
  },
  async createIntegrationConfiguration(apartmentId, data) {
    const response = await Api.post(`/apartments/${apartmentId}/integration-configurations`, data);

    return response.data;
  },
  async updateIntegrationConfiguration(apartmentId, linkedCalendar) {
    const response = await Api.put(
      `/apartments/${apartmentId}/integration-configurations/${linkedCalendar.id}`,
      linkedCalendar
    );

    return response.data;
  },
  /* Booking.com */
  async setupBookingIntegration(apartmentId, pulseCode) {
    const response = await Api.post(`/apartments/${apartmentId}/booking-integration-setup/${pulseCode}`);

    return response.data;
  },
  async syncBookingReservations(apartmentId) {
    const response = await Api.post(`/apartments/${apartmentId}/sync-booking`);

    return response.data;
  },
  /* Airbnb */
  async setupAirbnbIntegration(apartmentId) {
    const response = await Api.post(`/apartments/${apartmentId}/airbnb-integration-setup`);

    return response.data;
  },
  async syncAirbnbReservations(apartmentId) {
    const response = await Api.post(`/apartments/${apartmentId}/sync-airbnb`);

    return response.data;
  },
};
