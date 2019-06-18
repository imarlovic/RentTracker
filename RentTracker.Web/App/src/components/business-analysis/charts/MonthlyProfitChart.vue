v<template>
  <div class="w-full md:w-1/2 flex-shrink-0 flex flex-col">
    <div class="w-full px-6 flex justify-center">
      <span class="text-xl text-gray-800 font-semibold">Monthly profit</span>
    </div>

    <apexchart
      ref="chart"
      type="line"
      :options="options"
      :height="400"
      :series="series"
    ></apexchart>

  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import ReservationChart from "@/components/shared/charts/ReservationChart";
import FormattingFilters from "@/mixins/FormattingFilters";
import ChartConstants from "@/mixins/ChartConstants";
import * as moment from "moment";
import groupBy from "lodash.groupby";

export default {
  name: "MonthlyProfitChart",
  extends: ReservationChart,
  mixins: [FormattingFilters, ChartConstants],
  props: {
    expenses: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      options: {
        colors: ["#48BB78", "#4299E1", "#E53E3E"],
        chart: {
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        fill: {
          opacity: 1
        },
        stroke: {
          curve: "smooth"
        },
        tooltip: {
          y: {
            formatter: function(value) {
              return this.$options.filters.money(value, "HRK");
            }.bind(this)
          }
        },
        yaxis: {
          axisBorder: {
            show: true
          },
          labels: {
            rotate: 0,
            formatter: function(value) {
              return value.toFixed(0) + " HRK";
            }.bind(this)
          }
        },
        xaxis: {
          labels: {
            formatter: function(value) {
              return this.monthNames[value];
            }.bind(this)
          },
          categories: []
        }
      }
    };
  },
  computed: {
    series() {
      let monthSet = new Set();
      let reservationsObject = {};
      let expensesObject = {};

      this.reservations.forEach(r => {
        let month = new Date(r.startDate).getMonth();

        monthSet.add(month);

        let reservationEarnings =
          r.currency === "EUR" ? r.earnings * 7.5 : r.earnings;

        reservationsObject[month] =
          reservationEarnings + (reservationsObject[month] || 0.0);
      });

      this.expenses.forEach(e => {
        let month = new Date(e.date).getMonth();

        monthSet.add(month);

        let amount = e.currency === "EUR" ? e.amount * 7.5 : e.amount;

        expensesObject[month] = amount + (expensesObject[month] || 0.0);
      });

      let months = [...monthSet];
      months.sort((a, b) => a > b);

      let incomeSeries = {
        name: "Income",
        type: "column",
        data: months.map(month => reservationsObject[month] || 0.0)
      };

      let expensesSeries = {
        name: "Expense",
        type: "column",
        data: months.map(month => expensesObject[month] || 0.0)
      };

      let profitSeries = {
        name: "Profit",
        type: "line",
        data: incomeSeries.data.map(
          (income, index) => income - expensesSeries.data[index]
        )
      };

      this.$nextTick(() => {
        this.$refs.chart.updateOptions({ xaxis: { categories: months } });
      });

      return [incomeSeries, profitSeries, expensesSeries];
    }
  }
};
</script>
