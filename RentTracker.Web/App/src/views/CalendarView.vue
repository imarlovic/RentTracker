<template>
  <div class="flex justify-center items-center md:p-4">
    <router-view v-if="activeApartment"></router-view>
    <div
      class="mt-12"
      v-else
    >
      <h1 class="text-gray-900">Please pick an apartment to see the calendar</h1>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "CalendarView",
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment
    })
  },
  watch: {
    activeApartment: {
      immediate: true,
      handler: function(apartment) {
        if (apartment) {
          this.getReservations(apartment.id);
        }
      }
    }
  },
  methods: {
    ...mapActions({
      getReservations: "apartment/getReservations"
    })
  }
};
</script>
<style lang="scss" scoped>
</style>
