<template>
  <div class="w-full flex flex-col">
    <div class="flex flex-wrap px-2">
      <img
        class="integration-logo pr-4 mb-4"
        src="/img/logos/airbnb_logo.png"
        alt=""
      >
      <div class="flex items-center mb-4">
        <integration-status :configuration="configuration"></integration-status>
      </div>

    </div>
    <div class="w-full flex flex-wrap">
      <r-field
        label="Username"
        class="ml-0 w-64"
      >
        <input
          placeholder="Username"
          class="input"
          type="text"
          v-model="username"
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
        > <span
            class="pr-2"
            :class="{ rotate: savingConfig }"
          >
            <i class="fas fa-cog"></i>
          </span>Configure</button>
      </r-field>
    </div>
  </div>
</template>
<script>
import RField from "@/components/shared/RField";
import IntegrationStatus from "@/components/integration/IntegrationStatus";
import { mapState, mapActions } from "vuex";

export default {
  name: "AirbnbIntegration",
  components: {
    RField,
    IntegrationStatus
  },
  data() {
    return {
      username: "",
      password: "",
      syncInProgress: false,
      savingConfig: false
    };
  },
  computed: {
    ...mapState({
      configuration: state => state.apartment.airbnbIntegrationConfiguration
    }),
    status() {
      return this.configuration
        ? this.configuration.status.toUpperCase()
        : "UNSET";
    },
    changed() {
      return this.configuration
        ? this.username !== this.configuration.username ||
            this.password !== this.configuration.password
        : true;
    }
  },
  watch: {
    configuration: {
      immediate: true,
      handler: function(configuration) {
        if (configuration) {
          this.username = configuration.username;
          this.password = configuration.password;
        }
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateIntegrationConfiguration",
      setupIntegration: "apartment/setupAirbnbIntegration",
      syncReservations: "apartment/syncAirbnbReservations"
    }),
    async trySave() {
      try {
        let formData = {
          ...this.configuration,
          username: this.username,
          password: this.password,
          provider: "Airbnb"
        };

        await this.createOrUpdate(formData);
      } catch (e) {
        console.log(e);
      }
    },
    async tryConfigure() {
      try {
        this.savingConfig = true;
        await this.setupIntegration();
      } catch (e) {
        console.log(e);
      } finally {
        this.savingConfig = false;
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
