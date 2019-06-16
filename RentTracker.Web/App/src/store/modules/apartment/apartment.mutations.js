export default {
  /* Reservation */
  setReservations(state, reservations) {
    state.reservations = reservations || [];
  },
  createOrUpdateReservation(state, reservation) {
    let existingIndex = state.reservations.findIndex(r => r.id === reservation.id);

    if (existingIndex !== -1) {
      state.reservations[existingIndex] = reservation;
    } else {
      state.reservations.push(reservation);
    }
  },
  deleteReservation(state, reservationId) {
    let i = state.reservations.findIndex(r => r.id === reservationId);

    if (i !== -1) {
      state.reservations.splice(i, 1);
    }
  },
  /* Linked calendar */

  setLinkedCalendars(state, linkedCalendars) {
    state.linkedCalendars = linkedCalendars || [];
  },
  createOrUpdateLinkedCalendar(state, linkedCalendar) {
    let existingIndex = state.linkedCalendars.findIndex(lc => lc.id === linkedCalendar.id);

    if (existingIndex !== -1) {
      state.linkedCalendars[existingIndex] = linkedCalendar;
    } else {
      state.linkedCalendars.push(linkedCalendar);
    }
  },
  deleteLinkedCalendar(state, linkedCalendarId) {
    let i = state.linkedCalendars.findIndex(lc => lc.id === linkedCalendarId);

    if (i !== -1) {
      state.linkedCalendars.splice(i, 1);
    }
  },

  /* Expense */

  setExpenses(state, expenses) {
    state.expenses = expenses || [];
  },
  createOrUpdateExpense(state, expense) {
    let existingIndex = state.expenses.findIndex(lc => lc.id === expense.id);

    if (existingIndex !== -1) {
      state.expenses[existingIndex] = expense;
    } else {
      state.expenses.push(expense);
    }
  },
  deleteExpense(state, expenseId) {
    let i = state.expenses.findIndex(lc => lc.id === expenseId);

    if (i !== -1) {
      state.expenses.splice(i, 1);
    }
  },

  /* Document */

  setDocuments(state, documents) {
    state.documents = documents || [];
  },
  createOrUpdateDocument(state, document) {
    let existingIndex = state.documents.findIndex(d => d.id === document.id);

    if (existingIndex !== -1) {
      state.documents[existingIndex] = document;
    } else {
      state.documents.push(document);
    }
  },
  deleteDocument(state, documentId) {
    let i = state.documents.findIndex(d => d.id === documentId);

    if (i !== -1) {
      state.documents.splice(i, 1);
    }
  },

  /* Integration Configuration */

  setIntegrationConfigurations(state, integrationConfigurations) {
    if (integrationConfigurations && integrationConfigurations.length > 0) {
      state.bookingIntegrationConfiguration = integrationConfigurations.find(i => i.provider === 'Booking') || null;
      state.airbnbIntegrationConfiguration = integrationConfigurations.find(i => i.provider === 'Airbnb') || null;
    }
  },
  createOrUpdateIntegrationConfiguration(state, data) {
    if (!data) return;

    switch (data.provider) {
      case 'Booking':
        state.bookingIntegrationConfiguration = data
        break;
      case 'Airbnb':
        state.airbnbIntegrationConfiguration = data
        break;
    }
  },
};
