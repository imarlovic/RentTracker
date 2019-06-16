<template>
  <div class="flex justify-center items-center p-4">
    <integration-setup v-if="activeApartment"></integration-setup>
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
import IntegrationSetup from "@/components/integration/IntegrationSetup.vue";

export default {
  name: "IntegrationView",
  components: {
    IntegrationSetup
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
          this.getIntegrationConfigurations(apartment.id);
        }
      }
    }
  },
  methods: {
    ...mapActions({
      getIntegrationConfigurations: "apartment/getIntegrationConfigurations"
    })
  }
};
</script>
<style lang="scss" scoped>
</style>
