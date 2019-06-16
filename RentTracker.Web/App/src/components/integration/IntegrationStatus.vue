<template>
  <div class="w-full flex">
    <span class="text-gray-600">{{statusDescription}}</span>
    <span
      class="mx-2"
      :class="iconClasses"
    ><i
        class="fas"
        :class="icon"
      ></i></span>
    <span
      v-if="configuration"
      class="text-gray-600 ml-4"
      :title="configuration.lastUpdated"
    >{{updateDate}}</span>
  </div>
</template>
<script>
import * as moment from "moment";

export default {
  name: "IntegrationStatus",
  props: {
    configuration: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      statusDescription: "",
      iconClasses: "",
      icon: ""
    };
  },
  computed: {
    updateDate() {
      return this.configuration &&
        this.configuration.lastUpdated &&
        this.configuration.status !== "NotConfigured"
        ? "Last updated: " + moment(this.configuration.lastUpdated).fromNow()
        : "";
    }
  },
  watch: {
    "configuration.status": {
      immediate: true,
      handler: function(status = "") {
        switch (status.toUpperCase()) {
          case "NOTCONFIGURED":
            this.statusDescription = "Not configured";
            this.iconClasses = "text-gray-600";
            this.icon = "fa-question-circle";
            break;
          case "FAILED":
            this.statusDescription = "Failed";
            this.iconClasses = "text-red-600";
            this.icon = "fa-exclamation-triangle";
            break;
          case "WORKING":
            this.statusDescription = "Working";
            this.iconClasses = "text-green-600";
            this.icon = "fa-check";
            break;
          default:
            this.statusDescription = "N/A";
            this.iconClasses = "text-gray-600";
            this.icon = "fa-question-circle";
        }
      }
    }
  }
};
</script>
