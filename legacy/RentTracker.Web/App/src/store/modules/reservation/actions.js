import ApiFactory from "@/api/ApiFactory";

const ApartmentsApi = ApiFactory.get("apartments");

export default {
  getReservations: ({ commit }, apartmentId) =>
    new Promise(async (resolve, reject) => {
      try {
        let reservations = await ApartmentsApi.getReservations(apartmentId);
        commit("setReservations", reservations);
        resolve(reservations);
      } catch (e) {
        reject(e);
      }
    })
};
