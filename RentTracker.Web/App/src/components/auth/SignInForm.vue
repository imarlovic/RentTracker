<template>
  <form
    class="bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4"
    method="POST"
    @submit="attemptLogin"
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
        :class="{ 'border-red-500': isDirty && !username }"
        id="username"
        name="UserName"
        type="text"
        placeholder="Username"
        v-model="username"
      >
      <p
        v-if="isDirty && !username"
        class="text-red-500 text-xs italic"
      >Please enter a password.</p>
    </div>
    <div class="mb-6">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="password"
      >
        Password
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        :class="{ 'border-red-500': isDirty && !password }"
        id="password"
        name="Password"
        type="password"
        placeholder="Password"
        v-model="password"
      >
      <p
        v-if="isDirty && !password"
        class="text-red-500 text-xs italic"
      >Please enter a password.</p>
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
        class="w-full hover:shadow-xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Sign In
      </button>
      <!-- <a
        class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
        href="#"
      >
        Forgot Password?
      </a> -->
    </div>
    <div class="mt-4 flex items-center justify-center">
      <a
        class="hover:shadow-xl flex-grow flex shadow text-gray-600 font-semibold p-2 rounded focus:outline-none focus:shadow-outline"
        href="/auth/external?provider=Google&returnUrl=/"
      >
        <img
          class="w-6"
          src="/img/logos/google_g_logo.png"
          alt=""
        >
        <span class="px-4">Sign in with Google</span>
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
      isDirty: false,
      username: "",
      password: ""
    };
  },
  computed: {
    isValid() {
      return this.username && this.password;
    }
  },
  methods: {
    attemptLogin(e) {
      this.isDirty = true;

      if (this.isValid) {
        // var formData = new FormData();
        // formData.set("UserName", this.username);
        // formData.set("Password", this.password);
        // formData.set("RememberLogin", false);
        // formData.set("ReturnUrl", "/");
        // axios.post(`/auth/login`, formData, {
        //   headers: { "Content-Type": "multipart/form-data" }
        // });
      } else {
        e.preventDefault();
      }
    }
  }
};
</script>
