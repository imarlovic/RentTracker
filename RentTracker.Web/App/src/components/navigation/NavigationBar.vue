<template>
  <nav class="navbar flex items-center justify-start flex-wrap bg-blue-600 p-0 shadow-lg h-12 md:h-auto">
    <div class="flex items-center flex-no-shrink text-white mr-6">
      <button
        class="md:hidden"
        @click="toggleDrawer"
      ><span class="icon"><i class="fas fa-bars"></i></span></button>
      <router-link
        to="/apartments"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-hotel"></i></span><span class="description">Apartments</span></router-link>
      <router-link
        to="/calendar"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-calendar"></i></span><span class="description">Calendar</span></router-link>
      <router-link
        to="/expenses"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-file-invoice-dollar"></i></span><span class="description">Expenses</span></router-link>
      <router-link
        to="/integrations"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-layer-group"></i></span><span class="description">Integrations</span></router-link>
      <router-link
        to="/documents"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-file-alt"></i></span><span class="description">Documents</span></router-link>
      <router-link
        to="/business-analysis"
        class="hidden md:block nav-link"
      ><span class="icon"><i class="fas fa-chart-line"></i></span><span class="description">Business analysis</span></router-link>
    </div>
    <div class="flex text-white md:items-end md:ml-auto">
      <p
        v-if="activeApartment"
        class="font-semibold"
      >{{activeApartment.name}}</p>
      <a
        class="hidden md:block ml-4 px-4 font-semibold"
        href="/auth/sign-out"
      ><span class="icon"><i class="fas fa-sign-out-alt"></i></span></a>
    </div>
    <div
      v-show="drawerOpen"
      class="drawer min-h-screen w-full fixed top-0 left-0 flex flex-col justify-center items-center bg-blue-600"
    >
      <router-link
        to="/apartments"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i class="pr-2 fas fa-hotel"></i>Apartments</router-link>
      <router-link
        to="/calendar"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i class="pr-2 fas fa-calendar"></i>Calendar</router-link>
      <router-link
        to="/expenses"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i class="pr-2 fas fa-file-invoice-dollar"></i>Expenses</router-link>
      <router-link
        to="/integrations"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i class="pr-2 fas fa-layer-group"></i>Integrations</router-link>
      <router-link
        to="/business-analysis"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i class="pr-2 fas fa-chart-line"></i>Business analysis</router-link>
      <div class="flex flex-col items-center text-white mt-auto">
        <a
          class="p-4 font-semibold"
          href="/auth/sign-out"
        > <span class="icon"><i class="fas fa-sign-out-alt"></i></span> Sign out</a>
      </div>
    </div>
  </nav>
</template>
<script>
import { mapState } from "vuex";
export default {
  name: "NavigationBar",
  data() {
    return {
      drawerOpen: false
    };
  },
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment
    })
  },
  methods: {
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    }
  }
};
</script>
<style scoped>
.navbar {
  transition: all 500ms ease-in;
}
.drawer {
  z-index: 99999999;
}
</style>
