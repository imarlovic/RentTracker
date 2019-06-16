import ApartmentsApi from "./ApartmentsApi";
import ReservationsApi from "./ReservationsApi";
import NotificationsApi from "./NotificationsApi"

const apis = {
  apartments: ApartmentsApi,
  reservations: ReservationsApi,
  notifications: NotificationsApi
  // other repositories ...
};

export default {
  get: name => apis[name]
};
