<template>
  <loading-indicator v-if="isLoading"></loading-indicator>
  <div
    v-else
    class="max-w-3xl w-full flex flex-col justify-center items-center pt-4 md:pt-8 px-4"
  >
    <booking-integration class="mb-10"></booking-integration>
    <airbnb-integration></airbnb-integration>
  </div>
</template>
<script>
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import BookingIntegration from "@/components/integration/BookingIntegration";
import AirbnbIntegration from "@/components/integration/AirbnbIntegration";
import { mapState } from "vuex";

export default {
  name: "IntegrationSetup",
  components: { LoadingIndicator, BookingIntegration, AirbnbIntegration },
  computed: {
    ...mapState({
      isLoading: state =>
        state.apartment.status.integrationConfiguration.loading
    })
  }
};
</script>
<style scoped>
</style>
