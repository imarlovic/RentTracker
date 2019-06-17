import ApiFactory from "@/api/ApiFactory";

const ApartmentsApi = ApiFactory.get("apartments");

export default {
  getApartments: ({ commit }) =>
    new Promise(async (resolve, reject) => {
      try {
        let apartments = await ApartmentsApi.get();
        commit("setApartments", apartments);
        resolve(apartments);
      } catch (e) {
        reject(e);
      }
    })
}
