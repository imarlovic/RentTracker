<template>
  <div class="flex flex-col justify-center items-center p-4">
    <template v-if="activeApartment">
      <business-analysis-toolbar v-model="query" />
      <div class="mt-6 w-full flex flex-wrap flex-row justify-center">
        <monthly-profit-chart
          class=""
          :reservations="filteredReservationsByDate"
          :expenses="filteredExpensesByDate"
        ></monthly-profit-chart>
        <monthly-income-chart
          class=""
          :reservations="filteredReservations"
        ></monthly-income-chart>
      </div>

      <div class="mt-12 w-full flex flex-wrap flex-row justify-center">
        <source-distribution-chart
          class=""
          :reservations="filteredReservationsByDate"
        ></source-distribution-chart>
        <guest-number-distribution-chart
          class=""
          :reservations="filteredReservations"
        ></guest-number-distribution-chart>
        <country-distribution-chart
          class=""
          :reservations="filteredReservations"
        ></country-distribution-chart>
      </div>
    </template>
    <div
      class="mt-12"
      v-else
    >
      <h1 class="text-gray-900">Please pick an apartment to see business analysis</h1>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import BusinessAnalysisToolbar from "@/components/business-analysis/BusinessAnalysisToolbar";
import MonthlyIncomeChart from "@/components/business-analysis/charts/MonthlyIncomeChart";
import MonthlyProfitChart from "@/components/business-analysis/charts/MonthlyProfitChart";
import SourceDistributionChart from "@/components/business-analysis/charts/SourceDistributionChart";
import GuestNumberDistributionChart from "@/components/business-analysis/charts/GuestNumberDistributionChart";
import CountryDistributionChart from "@/components/business-analysis/charts/CountryDistributionChart";

import * as moment from "moment";

export default {
  name: "BusinessAnalysisView",
  components: {
    BusinessAnalysisToolbar,
    MonthlyIncomeChart,
    MonthlyProfitChart,
    SourceDistributionChart,
    GuestNumberDistributionChart,
    CountryDistributionChart
  },
  data() {
    return {
      query: {}
    };
  },
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment
    }),
    ...mapState({
      reservations: state => state.apartment.reservations,
      expenses: state => state.apartment.expenses
    }),
    filteredExpensesByDate() {
      let result = this.expenses;

      if (this.query.startDate) {
        result = result.filter(e => new Date(e.date) >= this.query.startDate);
      }

      if (this.query.endDate) {
        result = result.filter(e => new Date(e.date) <= this.query.endDate);
      }

      return result;
    },
    filteredReservationsByDate() {
      let result = this.reservations;

      if (this.query.startDate) {
        result = result.filter(
          r => new Date(r.startDate) >= this.query.startDate
        );
      }

      if (this.query.endDate) {
        result = result.filter(r => new Date(r.endDate) <= this.query.endDate);
      }

      return result;
    },
    filteredReservations() {
      let result = this.reservations;

      if (this.query.startDate) {
        result = result.filter(
          r => new Date(r.startDate) >= this.query.startDate
        );
      }

      if (this.query.endDate) {
        result = result.filter(r => new Date(r.endDate) <= this.query.endDate);
      }

      if (this.query.selectedSource) {
        result = result.filter(r => r.source === this.query.selectedSource);
      }

      return result;
    }
  },
  watch: {
    activeApartment: {
      immediate: true,
      handler: function(apartment) {
        if (apartment) {
          this.getReservations(apartment.id);
          this.getExpenses();
        }
      }
    }
  },
  methods: {
    ...mapActions({
      getExpenses: "apartment/getExpenses",
      getReservations: "apartment/getReservations"
    })
  }
};
</script>
<style scoped>
</style>
