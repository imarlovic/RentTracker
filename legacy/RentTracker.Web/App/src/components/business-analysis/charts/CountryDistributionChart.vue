<template>
  <div class="w-full md:w-1/2 xl:w-1/3 flex flex-col">
    <div class="w-full px-6 mb-6 flex justify-center">
      <span class="text-xl text-gray-800 font-semibold">Reservations by country</span>
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
import groupBy from "lodash.groupby";

export default {
  name: "CountryDistributionChart",
  extends: ReservationChart,
  data() {
    return {
      options: {
        colors: ["#3182CE", "#38A169", "#805AD5", "#DD6B20"],
        chart: {
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: true
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
              offset: -40,
              minAngleToShowLabel: 10
            }
          }
        }
      }
    };
  },
  computed: {
    series() {
      let mapByCountry = collection => groupBy(collection, "country");
      let reservations = this.reservations.filter(r => r.country != null);

      let countryMap = mapByCountry(reservations);

      let countries = Object.keys(countryMap).filter(
        country => countryMap[country].length / reservations.length > 0.1
      );

      let series = countries.map(label => countryMap[label].length);

      countries.push("Other");
      series.push(
        reservations.filter(r => !countries.includes(r.country)).length
      );

      this.$nextTick(() => {
        this.$refs.chart.updateOptions({ labels: countries });
      });

      return series;
    }
  }
};
</script>
