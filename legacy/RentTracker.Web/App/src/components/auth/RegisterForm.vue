<template>
  <form
    class="bg-white rounded-b shadow-md px-8 pt-6 pb-8 mb-4"
    action="/auth/register"
    method="POST"
    @submit="attemptRegister"
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
        :class="{ 'border-red-500': isDirty && !firstName }"
        id="firstname"
        name="FirstName"
        type="text"
        placeholder="First name"
        v-model="firstName"
      >
      <p
        v-if="isDirty && !firstName"
        class="text-red-500 text-xs italic"
      >Please enter first name.</p>
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
        :class="{ 'border-red-500': isDirty && !lastName }"
        id="lastname"
        name="LastName"
        type="text"
        placeholder="Last name"
        v-model="lastName"
      >
      <p
        v-if="isDirty && lastName"
        class="text-red-500 text-xs italic"
      >Please enter last name.</p>
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
        :class="{ 'border-red-500': isDirty && !email }"
        id="email"
        name="Email"
        type="email"
        placeholder="Email"
        v-model="email"
      >
      <p
        v-if="isDirty && !email"
        class="text-red-500 text-xs italic"
      >Please enter email.</p>
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
      >Please enter username.</p>
    </div>
    <div class="mb-6">
      <label
        class="block text-gray-700 text-sm font-bold mb-2"
        for="password"
      >
        Password
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        :class="{ 'border-red-500': isDirty && !password }"
        id="password"
        name="Password"
        type="password"
        placeholder="******************"
        v-model="password"
      >
      <p
        v-if="isDirty && !password"
        class="text-red-500 text-xs italic"
      >Please choose a password.</p>
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
        class="shadow hover:shadow-lg flex-grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
      isDirty: false,
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: ""
    };
  },
  computed: {
    isValid() {
      return (
        this.firstName &&
        this.lastName &&
        this.email &&
        this.username &&
        this.password
      );
    }
  },
  methods: {
    attemptRegister(e) {
      this.isDirty = true;
      if (this.isValid) {
        // var formData = new FormData();
        // formData.set("FirstName", this.firstName);
        // formData.set("LastName", this.lastName);
        // formData.set("Email", this.email);
        // formData.set("UserName", this.username);
        // formData.set("Password", this.password);
        // axios.post(`/auth/register`, formData, {
        //   headers: { "Content-Type": "multipart/form-data" }
        // });

        window.localStorage.removeItem("vuex");
      } else {
        e.preventDefault();
      }
    }
  }
};
</script>
