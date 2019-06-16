<template>
  <div
    :title="title"
    class="day relative border border-gray-400 hover:bg-gray-200 hover:border-2"
    :class="dayClasses"
    :style="dayStyle"
    @click="triggerAction"
  >
    <span class="absolute top-0 left-0 p-1 md:p-2 font-bold text-xs md:text-md">{{dayOfMonth}}</span>
    <div
      @click="openReservation(startingReservation)"
      :title="getReservationDescription(startingReservation)"
      v-if="startingReservation"
      class="reservation-ribbon hover:shadow-lg first-day"
    >
      <span
        class="guest-icon"
        :class="guestIconClass"
      >{{getGuestInitials(startingReservation)}}</span>
    </div>
    <div
      @click="openReservation(inProgressReservation)"
      :title="getReservationDescription(inProgressReservation)"
      v-if="inProgressReservation"
      class="reservation-ribbon hover:shadow-lg"
    ></div>
    <div
      @click="openReservation(endingReservation)"
      :title="getReservationDescription(endingReservation)"
      v-if="endingReservation"
      class="reservation-ribbon hover:shadow-lg last-day"
    ></div>
  </div>
</template>
<script>
import * as moment from "moment";
import { mapState, mapGetters } from "vuex";
export default {
  name: "Day",
  props: {
    day: {
      type: Object,
      required: true
    }
  },
  computed: {
    startingReservation() {
      return this.$store.getters["apartment/getStartingReservation"](
        this.day.date
      );
    },
    endingReservation() {
      return this.$store.getters["apartment/getEndingReservation"](
        this.day.date
      );
    },
    inProgressReservation() {
      return this.$store.getters["apartment/getInProgressReservation"](
        this.day.date
      );
    },
    title() {
      return this.day.date.toLocaleDateString();
    },
    dayOfMonth() {
      return this.day.date.getDate();
    },
    dayClasses() {
      let classes = [];

      if (!this.day.isCurrentMonth) {
        classes.push("bg-gray-300 shadow-inner");
      }

      return classes.join(" ").trim();
    },
    dayStyle() {
      // return `z-index:${this.day.date.getMonth() * 30 + this.dayOfMonth};`;
      return "";
    },
    reservationClass() {
      let _class = "";
      if (this.startingReservation) {
        _class = "first-day";
      } else if (this.endingReservation) {
        _class = "last-day";
      }

      return _class;
    },
    guestIconClass() {
      if (this.startingReservation) {
        switch (this.startingReservation.source) {
          case "Airbnb":
            return "bg-airbnb";
          case "Booking":
            return "bg-booking";
          default:
            return "bg-renttracker";
        }
      } else {
        return "";
      }
    }
  },
  methods: {
    triggerAction() {
      if (!this.startingReservation || !this.inProgressReservation) {
        this.$emit("trigger:new", this.day.date);
      }
    },
    openReservation(reservation) {
      this.$emit("reservation:selected", reservation);
    },
    getReservationDescription(reservation) {
      let period = `${moment(reservation.startDate).format(
        "DD.MM."
      )} - ${moment(reservation.endDate).format("DD.MM.")}`;
      return `${reservation.holdingName} | ${period}`;
    },
    getGuestInitials(reservation) {
      if (!reservation.holdingName) console.log(reservation);
      let names = reservation.holdingName.split(/\s/);

      return names[0][0] + names[names.length - 1][0];
    }
  }
};
</script>
<style lang="scss" scoped>
.reservation-ribbon {
  background-color: #90cdf4;
  position: absolute;
  bottom: 16px;
  height: 28px;
  width: calc(100%);

  transition: box-shadow 150ms ease-out;
}

.reservation-ribbon:hover {
  // transform: translate(0px, -3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.35);
}

.reservation-ribbon.first-day {
  width: 50%;
  left: 50%;
  border-top-left-radius: 2rem;
  border-bottom-left-radius: 2rem;
}

.reservation-ribbon.last-day {
  width: 50%;
  right: 50%;
  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
}

.guest-icon {
  color: white;
  display: block;
  box-sizing: border-box;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  margin-top: 2px;
  margin-left: 2px;
  font-size: 0.6rem;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
}

@media only screen and (max-width: 640px) {
  .reservation-ribbon {
    bottom: 8px;
    height: 22px;
  }

  .guest-icon {
    margin-top: 1px;
    margin-left: 1px;
    height: 20px;
    width: 20px;
  }
}
</style>
