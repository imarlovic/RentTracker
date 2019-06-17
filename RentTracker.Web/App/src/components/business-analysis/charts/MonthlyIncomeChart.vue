<template>
  <div class="w-full md:w-1/2 flex-shrink-0 flex flex-col">
    <div class="w-full px-6 flex justify-center">
      <span class="text-xl text-gray-800 font-semibold">Monthly income</span>
    </div>

    <apexchart
      ref="chart"
      type="bar"
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
  name: "MonthlyIncomeChart",
  extends: ReservationChart,
  mixins: [FormattingFilters, ChartConstants],
  data() {
    return {
      options: {
        chart: {
          stacked: true,
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
      let sourcesObject = {};

      this.reservations.forEach(r => {
        let source = r.source;
        let month = new Date(r.startDate).getMonth();

        monthSet.add(month);

        let sourceObject =
          sourcesObject[source] || (sourcesObject[source] = { type: "column" });
        // let totalObject =
        //   sourcesObject["Total"] || (sourcesObject["Total"] = { type: "line" });

        let reservationEarnings =
          r.currency === "EUR" ? r.earnings * 7.5 : r.earnings;

        sourceObject[month] =
          reservationEarnings + (sourceObject[month] || 0.0);
        // totalObject[month] = reservationEarnings + (totalObject[month] || 0.0);
      });

      let seriesNames = Object.keys(sourcesObject);
      let months = [...monthSet];
      months.sort((a, b) => a > b);

      let allSeries = seriesNames.map(name => ({
        name: name,
        type: sourcesObject[name].type,
        data: months.map(month => sourcesObject[name][month] || 0.0)
      }));

      this.$nextTick(() => {
        this.$refs.chart.updateOptions({
          colors: allSeries.map(
            series => this.seriesColorMap[series.name] || "#333"
          ),
          xaxis: { categories: months }
        });
      });

      return allSeries;
    }
  }
};
</script>
