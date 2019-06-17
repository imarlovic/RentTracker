<template>
  <div class="max-h-full max-w-full flex justify-center items-start flex-grow">
    <upcoming-timeline v-if="activeApartment"></upcoming-timeline>
    <div
      class="mt-12"
      v-else
    >
      <h1 class="text-gray-900">Please pick an apartment to see upcoming reservations</h1>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import UpcomingTimeline from "@/components/upcoming/UpcomingTimeline";
export default {
  name: "UpcomingView",
  components: {
    UpcomingTimeline
  },
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
