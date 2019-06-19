import axios from "axios";

// You can use your own logic to set your local or production domain
const baseDomain = "/api";
// The base URL is empty this time due we are using the jsonplaceholder API
const baseURL = `${baseDomain}`;

const api = axios.create({
  baseURL,
});

api.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response.status === 401) window.location.replace(`/auth/login?redirectUrl=${window.location.pathname}`)
  return Promise.reject(error)
});

export default api;
