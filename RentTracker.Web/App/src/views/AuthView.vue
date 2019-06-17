<template>
  <div class="h-screen w-screen flex flex-col justify-center items-center bg-blue-600">
    <div class="absolute top-0 max-w-sm px-12 pt-4 md:pt-12">
      <img
        src="/img/logos/renttracker_logo_white.png"
        alt=""
      >
    </div>
    <div class="max-w-xs">
      <ul class="flex border-b-2 border-gray-400">
        <li
          class="cursor-pointer flex-grow  border-l border-t rounded-l rounded-bl-none py-2 px-4 text-center font-semibold "
          :class="computedClasses('SignInForm')"
          @click="activeForm = 'SignInForm'"
        >
          Sign in
        </li>
        <li
          class="cursor-pointer flex-grow py-2 px-4 rounded-r rounded-br-none text-center font-semibold"
          :class="computedClasses('RegisterForm')"
          @click="activeForm = 'RegisterForm'"
        >
          Register
        </li>
      </ul>
      <component :is="activeForm"></component>
      <p class="text-center text-gray-300 text-xs">
        &copy;2019 RentTracker. All rights reserved.
      </p>
    </div>
  </div>
</template>
<script>
import SignInForm from "@/components/auth/SignInForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default {
  name: "AuthView",
  components: { SignInForm, RegisterForm },
  data() {
    return {
      activeForm: "SignInForm",
      activeClasses: "bg-white text-blue-600",
      inactiveClasses:
        "bg-gray-500 border-gray-500 text-white hover:bg-white hover:border-white hover:text-blue-600"
    };
  },
  methods: {
    computedClasses(formName) {
      return this.activeForm === formName
        ? this.activeClasses
        : this.inactiveClasses;
    }
  }
};
</script>
