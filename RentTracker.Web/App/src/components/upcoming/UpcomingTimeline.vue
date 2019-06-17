<template>
  <div
    class="container max-w-full md:max-w-5xl flex flex-col justify-center items-center pt-2 px-2"
    @onscroll="(e) => { console.log(e)}"
  >

    <timeline-block
      :key="block.reservation.id"
      v-for="block in upcomingReservations"
      :title="block.reservation.startDate | date"
    >
      <upcoming-reservation :reservation="block.reservation"></upcoming-reservation>

      <div
        v-if="block.spacer"
        class="spacer flex flex-col my-4"
      >
        <span class="py-2"><i class="fas fa-circle"></i></span>
        <span class="py-2"><i class="fas fa-circle"></i></span>
        <span class="py-2"><i class="fas fa-circle"></i></span>
      </div>
    </timeline-block>

    <timeline-block
      ref="todayBlock"
      title="Today"
    >
      <upcoming-reservation
        v-if="todaysReservation"
        :reservation="todaysReservation"
      ></upcoming-reservation>
      <div
        class="text-md text-gray-800"
        v-else
      ><span class="icon pr-2"><i class="far fa-frown"></i></span>No reservation today</div>
      <!-- <div class="spacer flex my-4">
        <span class="px-2"><i class="fas fa-circle"></i></span>
        <span class="px-2"><i class="fas fa-circle"></i></span>
        <span class="px-2"><i class="fas fa-circle"></i></span>
      </div> -->
    </timeline-block>

    <timeline-block
      :key="block.reservation.id"
      v-for="block in completedReservations"
      :title="block.reservation.startDate | date"
    >
      <upcoming-reservation :reservation="block.reservation"></upcoming-reservation>

      <div
        v-if="block.spacer"
        class="spacer flex flex-col my-4"
      >
        <span class="py-2"><i class="fas fa-circle"></i></span>
        <span class="py-2"><i class="fas fa-circle"></i></span>
        <span class="py-2"><i class="fas fa-circle"></i></span>
      </div>
    </timeline-block>
    <button
      class="btn-reset bg-white border border-gray-800 text-gray-800"
      @click="resetView"
    ><span class="icon"><i class="fas fa-arrow-up"></i></span></button>
  </div>
</template>
<script>
import { mapState } from "vuex";
import * as moment from "moment";
import FormattingFilters from "@/mixins/FormattingFilters";
import TimelineBlock from "@/components/upcoming/TimelineBlock";
import UpcomingReservation from "@/components/upcoming/UpcomingReservation";

export default {
  name: "UpcomingTimeline",
  components: {
    TimelineBlock,
    UpcomingReservation
  },
  mixins: [FormattingFilters],
  data() {
    return {
      today: new Date(),
      blocks: []
    };
  },
  computed: {
    ...mapState({
      reservations: state => state.apartment.reservations
    }),
    todaysReservation() {
      let reservation =
        this.reservations.find(
          r =>
            moment(r.startDate).isSameOrBefore(this.today, "day") &&
            moment(r.endDate).isAfter(this.today, "day")
        ) || null;

      return reservation;
    },
    upcomingReservations() {
      return this.blocks.filter(b =>
        moment(b.reservation.startDate).isAfter(this.today, "day")
      );
    },
    completedReservations() {
      return this.blocks.filter(b =>
        moment(b.reservation.endDate).isBefore(this.today, "day")
      );
    }
  },
  watch: {
    reservations: {
      immediate: true,
      handler: function(reservations) {
        let orderedReservations = [...reservations];
        orderedReservations.sort(
          (a, b) =>
            new Date(a.startDate).valueOf() > new Date(b.startDate).valueOf()
        );

        let blocks = [];
        let endDate = null;

        for (let r of orderedReservations) {
          let block = { reservation: r, spacer: true };

          if (moment(endDate).isSame(r.startDate, "day")) {
            block.spacer = false;
          }

          blocks.push(block);

          endDate = r.endDate;
        }

        blocks.reverse();

        this.blocks = blocks;

        this.$nextTick(this.resetView, 500);
      }
    }
  },
  methods: {
    resetView() {
      this.$refs.todayBlock.$el.scrollIntoView();
    }
  }
};
</script>
<style>
.spacer {
  font-size: 0.2rem;
}

.btn-reset {
  font-size: 1rem;
  border-radius: 50%;
  position: absolute;
  width: 3rem;
  height: 3rem;
  bottom: 1.5rem;
  right: 1.5rem;
}
</style>
