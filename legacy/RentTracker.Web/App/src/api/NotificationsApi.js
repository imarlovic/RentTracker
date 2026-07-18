import Api from "./Api";

export default {
  async getPublicKey() {
    const response = await Api.get(`/notifications/public-key`);
    return response.data;
  },
  async subscribe(subscription) {
    const response = await Api.post(`/notifications/subscribe`, subscription);
    return response.data;
  },
  async unsubscribe(endpoint) {
    const response = await Api.delete(`/notifications/subscribe`, endpoint)
    return response.data;
  },
}
