import * as moment from "moment";

export default {
  getStartingReservation: state => date => {
    return state.reservations.find(r => moment(r.startDate).isSame(date, "day"));
  },
  getEndingReservation: state => date => {
    return state.reservations.find(r => moment(r.endDate).isSame(date, "day"));
  },
  getInProgressReservation: state => date => {
    return state.reservations.find(
      r => moment(r.startDate).isBefore(date, "day") && moment(r.endDate).isAfter(date, "day")
    );
  },
};
