<template>
  <div class="h-screen w-screen flex justify-center items-center bg-blue-800">
    <div class="max-w-xs">
      <ul class="flex border-b-2">
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
      <p class="text-center text-gray-500 text-xs">
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
        "bg-gray-400 border-gray-400 text-white hover:bg-white hover:border-white hover:text-blue-600"
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
