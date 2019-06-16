<template>
  <toolbar class="w-full">
    <r-field label="Start date">
      <date-input v-model="query.startDate"></date-input>
    </r-field>
    <r-field label="End date">
      <date-input v-model="query.endDate"></date-input>
    </r-field>
    <r-field label="Source">
      <r-select v-model="query.selectedSource">
        <option :value="null">Any</option>
        <option value="RentTracker">RentTracker</option>
        <option value="Airbnb">Airbnb</option>
        <option value="Booking">Booking</option>
      </r-select>
    </r-field>
  </toolbar>
</template>
<script>
import Toolbar from "@/components/shared/Toolbar";
import RField from "@/components/shared/RField";
import RSelect from "@/components/shared/RSelect";
import DateInput from "@/components/shared/DateInput";
import * as moment from "moment";

export default {
  name: "BusinessAnalysisToolbar",
  components: { Toolbar, RField, RSelect, DateInput },
  props: {
    value: {
      type: Object
    }
  },
  data() {
    return {
      query: {
        startDate: moment()
          .startOf("year")
          .toDate(),
        endDate: moment()
          .endOf("year")
          .toDate(),
        selectedSource: null
      }
    };
  },
  watch: {
    query: {
      immediate: true,
      handler: function(query) {
        this.$emit("input", query);
      }
    }
  }
};
</script>
<style scoped>
</style>
