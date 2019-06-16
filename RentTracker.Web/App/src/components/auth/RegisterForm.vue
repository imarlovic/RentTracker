<template>
  <form
    class="bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4"
    action="/auth/register"
    method="POST"
  >
    <div class="mb-4">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="firstname"
      >
        First name
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="firstname"
        name="FirstName"
        type="text"
        placeholder="First name"
        v-model="firstName"
      >
    </div>
    <div class="mb-4">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="lastname"
      >
        Last name
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="lastname"
        name="LastName"
        type="text"
        placeholder="Last name"
        v-model="lastName"
      >
    </div>
    <div class="mb-4">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="email"
      >
        Email
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="email"
        name="Email"
        type="email"
        placeholder="Email"
        v-model="email"
      >
    </div>
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
        class="flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        Register
      </button>
    </div>
  </form>
</template>
<script>
import axios from "axios";

export default {
  name: "RegisterForm",
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: ""
    };
  },
  methods: {
    attemptLogin() {
      var formData = new FormData();
      formData.set("FirstName", this.firstName);
      formData.set("LastName", this.lastName);
      formData.set("Email", this.email);
      formData.set("UserName", this.username);
      formData.set("Password", this.password);

      axios.post(`/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
  }
};
</script>
