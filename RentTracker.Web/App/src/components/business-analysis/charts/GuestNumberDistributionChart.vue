<template>
  <div class="w-full md:w-1/2 xl:w-1/3 flex flex-col">
    <div class="w-full px-6 mb-6 flex justify-center">
      <span class="text-xl text-gray-800 font-semibold">Guests per reservation</span>
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
  name: "GuestNumberDistributionChart",
  extends: ReservationChart,
  mixins: [FormattingFilters],
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
      let mapByPeople = collection => groupBy(collection, "people");

      let reservationsWithPeople = this.reservations.filter(r => r.people);

      let peopleMap = mapByPeople(reservationsWithPeople);

      console.log(peopleMap);

      let labels = Object.keys(peopleMap).filter(
        people =>
          peopleMap[people].length / reservationsWithPeople.length >= 0.1
      );

      this.$nextTick(() => {
        this.$refs.chart.updateOptions({ labels });
      });

      let series = labels.map(people => peopleMap[people].length);

      series = series;

      return series;
    }
  }
};
</script>
