import { monthsShort } from 'moment'

export default {
  data() {
    return {
      seriesColorMap: {
        RentTracker: "#3182ce",
        Booking: "#00347c",
        Airbnb: "#ff5a5f"
      },
      monthNames: monthsShort(),
    }
  }
}