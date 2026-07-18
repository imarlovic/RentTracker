import * as moment from "moment";

export default {
  reservationEndDateMap: state => {
    let map = {}

    for (let r of state.reservations) {
      let date = moment(r.endDate)
      let epoch = date.valueOf();
      map[epoch.toString()] = r;
    }

    return map
  },
  reservationStartDateMap: state => {
    let map = {}

    for (let r of state.reservations) {
      for (let r of state.reservations) {
        let date = moment(r.startDate)
        let epoch = date.valueOf();
        map[epoch.toString()] = r;
      }
    }

    return map
  },
  reservationInProgressDateMap: state => {
    let map = {}

    for (let r of state.reservations) {
      let date = moment(r.startDate).add(1, 'day')
      let epoch = date.valueOf();
      let endEpoch = moment(r.endDate).valueOf()

      while (epoch < endEpoch) {
        map[epoch.toString()] = r;
        epoch = date.valueOf()

        date.add(1, 'day')
      }
    }

    return map
  },
  getStartingReservation: (state, getters) => date => {
    let key = date.toString()
    return getters.reservationStartDateMap[key]
  },
  getEndingReservation: (state, getters) => date => {
    let key = date.toString()
    return getters.reservationEndDateMap[key]
  },
  getInProgressReservation: (state, getters) => date => {
    let key = date.toString()
    return getters.reservationInProgressDateMap[key]
  },
};
