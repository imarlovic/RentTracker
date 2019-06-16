<template>
  <div class="w-full md:w-1/2 xl:w-1/3 flex flex-col">
    <div class="w-full px-6 mb-6 flex justify-center">
      <span class="text-xl text-gray-800 font-semibold">Income by source</span>
    </div>

    <apexchart
      ref="chart"
      type="pie"
      :height="400"
      :options="options"
      :series="series"
    ></apexchart>

  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import ReservationChart from "@/components/shared/charts/ReservationChart";
import FormattingFilters from "@/mixins/FormattingFilters";
import * as moment from "moment";
import groupBy from "lodash.groupby";

export default {
  name: "SourceDistributionChart",
  extends: ReservationChart,
  mixins: [FormattingFilters],
  data() {
    return {
      options: {
        labels: [],
        colors: ["#319795", "#00347c", "#ff5a5f"],
        // colors: [
        //   function({ value, seriesIndex, w }) {
        //     var source = w.globals.seriesNames[seriesIndex];
        //     switch (source) {
        //       case "RentTracker":
        //         return "#319795";
        //       case "Booking":
        //         return "#00347c";
        //       case "Airbnb":
        //         return "#ff5a5f";
        //       default:
        //         return "#333333";
        //     }
        //   }
        // ],
        chart: {
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val, opts) {
            return this.$options.filters.money(
              opts.w.globals.series[opts.seriesIndex],
              "HRK"
            );
          }.bind(this)
        },
        tooltip: {
          y: {
            formatter: function(value, { series, seriesIndex }) {
              if (series && seriesIndex) {
                return this.$options.filters.money(series[seriesIndex], "HRK");
              } else if (value) {
                return this.$options.filters.money(value, "HRK");
              }
            }.bind(this)
          }
        },
        legend: {
          position: "bottom"
        },
        fill: {
          opacity: 1
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -40
            },
            customScale: 0.9
          }
        }
      }
    };
  },
  computed: {
    series() {
      let mapBySource = collection => groupBy(collection, "source");

      let getEarnings = collection =>
        collection.reduce(
          (sum, r) =>
            (sum += r.currency === "EUR" ? r.earnings * 7.5 : r.earnings),
          0.0
        );

      let sourceMap = mapBySource(this.reservations);

      this.$nextTick(() => {
        this.$refs.chart.updateOptions({ labels: Object.keys(sourceMap) });
      });

      let sourceSeries = Object.keys(sourceMap).map(source =>
        getEarnings(sourceMap[source])
      );

      return sourceSeries;
    }
  }
};
</script>
