<template>
  <form
    class="bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4"
    method="POST"
  >
    <div class="mb-4">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="username"
      >
        Username
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="username"
        name="UserName"
        type="text"
        placeholder="Username"
        v-model="username"
      >
    </div>
    <div class="mb-6">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="password"
      >
        Password
      </label>
      <input
        class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        id="password"
        name="Password"
        type="password"
        placeholder="******************"
        v-model="password"
      >
      <p class="text-red-500 text-xs italic">Please choose a password.</p>
    </div>
    <div class="flex items-center justify-between">
      <input
        name="RememberLogin"
        type="hidden"
        value="false"
      >
      <input
        name="ReturnUrl"
        type="hidden"
        value="/"
      >
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Sign In
      </button>
      <a
        class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
        href="#"
      >
        Forgot Password?
      </a>
    </div>
    <div class="mt-4 flex items-center justify-center">
      <a
        class="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        href="/auth/external?provider=Google&returnUrl=/"
      >
        <i class="fab fa-google"></i> Sign in with Google
      </a>
    </div>
  </form>
</template>
<script>
import axios from "axios";

export default {
  name: "SignInForm",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    attemptLogin() {
      var formData = new FormData();
      formData.set("UserName", this.username);
      formData.set("Password", this.password);
      formData.set("RememberLogin", false);
      formData.set("ReturnUrl", "/");

      axios.post(`/auth/login`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
  }
};
</script>
