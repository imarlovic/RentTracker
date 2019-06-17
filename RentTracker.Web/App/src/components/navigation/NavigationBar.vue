<template>
  <nav class="navbar flex items-center justify-start flex-wrap bg-blue-600 p-0 shadow-lg xl:h-auto">
    <div class="flex items-center flex-no-shrink text-white mr-6">
      <button
        class="nav-link text-xl px-4 xl:hidden"
        @click="toggleDrawer"
      ><span class="icon"><i class="fas fa-bars"></i></span></button>
      <router-link
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="hidden xl:block nav-link"
      ><span class="icon"><i :class="link.icon"></i></span><span class="description">{{link.label}}</span></router-link>
    </div>
    <div class="h-12 flex items-center text-white ml-auto pr-4 xl:pr-0">
      <p
        v-if="activeApartment"
        class="font-semibold"
      >{{activeApartment.name}}</p>
      <a
        class="nav-link hidden xl:block ml-4 px-4 text-md font-semibold"
        href="/auth/sign-out"
      ><span class="icon"><i class="fas fa-sign-out-alt"></i></span></a>
    </div>
    <div
      v-show="drawerOpen"
      class="drawer min-h-screen w-full fixed top-0 left-0 flex flex-col justify-center items-center bg-blue-600"
    >
      <div class="absolute top-0 text-2xl font-semibold tracking-widest text-white p-4">
        RentTracker
      </div>
      <router-link
        v-for="link in links"
        :key="link.path"
        :to="link.path"
        class="drawer-link w-full flex justify-center items-center py-4"
        @click.native="toggleDrawer"
      ><i
          class="w-5/12 text-right pr-6 flex-grow"
          :class="link.icon"
        ></i><span class="w-7/12">{{link.label}}</span></router-link>
      <div class="flex flex-col items-center text-white absolute bottom-0">
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
      drawerOpen: false,
      links: [
        {
          path: "/upcoming",
          label: "Upcoming",
          icon: "fas fa-stream"
        },
        {
          path: "/apartments",
          label: "Apartments",
          icon: "fas fa-hotel"
        },
        {
          path: "/calendar",
          label: "Calendar",
          icon: "fas fa-calendar"
        },
        {
          path: "/expenses",
          label: "Expenses",
          icon: "fas fa-file-invoice-dollar"
        },
        {
          path: "/integrations",
          label: "Integrations",
          icon: "fas fa-layer-group"
        },
        {
          path: "/business-analysis",
          label: "Statistics",
          icon: "fas fa-chart-line"
        }
      ]
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
