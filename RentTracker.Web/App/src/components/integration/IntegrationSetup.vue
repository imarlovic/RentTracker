<template>
  <div class="max-w-5xl w-full flex flex-col justify-center items-center pt-4 md:pt-8 px-4">
    <booking-integration class="mb-10"></booking-integration>
    <airbnb-integration></airbnb-integration>
  </div>
</template>
<script>
import BookingIntegration from "@/components/integration/BookingIntegration";
import AirbnbIntegration from "@/components/integration/AirbnbIntegration";

export default {
  name: "IntegrationSetup",
  components: { BookingIntegration, AirbnbIntegration }
};
</script>
<style scoped>
</style>
