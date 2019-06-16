<template>
  <div class="w-full flex flex-col">
    <div class="flex flex-wrap items-center px-2 ">
      <img
        class="integration-logo pr-4 mb-4"
        src="https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Booking.com_logo.svg/1280px-Booking.com_logo.svg.png"
        alt=""
      >
      <div class="flex items-center mb-4">
        <integration-status :configuration="configuration"></integration-status>
      </div>

    </div>
    <div class="w-full flex flex-wrap">
      <r-field
        label="Property ID"
        class="ml-0"
      >
        <input
          placeholder="Property ID"
          class="input"
          type="text"
          regex="(0-9)+"
          v-model="propertyId"
        >
      </r-field>
      <r-field label="Password">
        <input
          placeholder="Password"
          class="input"
          type="password"
          v-model="password"
        >
      </r-field>
      <r-field label="Pulse Code">
        <input
          placeholder="Pulse Code"
          class="input"
          type="text"
          v-model="pulseCode"
        >
      </r-field>
    </div>
    <div class="w-full flex">
      <r-field class="ml-0">
        <button
          v-if="changed"
          class="btn btn-primary mr-2"
          @click="trySave"
        > <i class="fas fa-save"></i></button>
        <button
          v-if="status === 'WORKING' || status === 'FAILED'"
          class="btn btn-primary mr-2"
          @click="trySync"
          :disabled="syncInProgress"
        > <span class="pr-2"><i
              class="fas fa-sync"
              :class="{ rotate: syncInProgress }"
            ></i></span>Sync</button>
        <button
          v-if="status !== 'WORKING'"
          class="btn btn-secondary mr-2"
          @click="tryConfigure"
        > <i class="pr-2 fas fa-cog"></i>Configure</button>
      </r-field>
    </div>
  </div>
</template>
<script>
import RField from "@/components/shared/RField";
import IntegrationStatus from "@/components/integration/IntegrationStatus";
import { mapState, mapActions } from "vuex";

export default {
  name: "BookingIntegration",
  components: {
    RField,
    IntegrationStatus
  },
  data() {
    return {
      propertyId: "",
      password: "",
      pulseCode: "",
      syncInProgress: false
    };
  },
  computed: {
    ...mapState({
      configuration: state => state.apartment.bookingIntegrationConfiguration
    }),
    status() {
      return this.configuration
        ? this.configuration.status.toUpperCase()
        : "UNSET";
    },
    changed() {
      return this.configuration
        ? this.propertyId !== this.configuration.propertyId ||
            this.password !== this.configuration.password
        : true;
    }
  },
  watch: {
    configuration: {
      immediate: true,
      handler: function(configuration) {
        if (configuration) {
          this.propertyId = configuration.propertyId;
          this.password = configuration.password;
        }
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateIntegrationConfiguration",
      setupIntegration: "apartment/setupBookingIntegration",
      syncReservations: "apartment/syncBookingReservations"
    }),
    async trySave() {
      try {
        let formData = {
          ...this.configuration,
          propertyId: this.propertyId,
          password: this.password,
          provider: "Booking"
        };

        await this.createOrUpdate(formData);
      } catch (e) {
        console.log(e);
      }
    },
    async tryConfigure() {
      try {
        await this.setupIntegration(this.pulseCode);
      } catch (e) {
        console.log(e);
      }
    },
    async trySync() {
      try {
        this.syncInProgress = true;
        await this.syncReservations();
      } catch (e) {
        console.log(e);
      } finally {
        this.syncInProgress = false;
      }
    }
  }
};
</script>
<style scoped>
.integration-logo {
  max-height: 2rem;
}
</style>
