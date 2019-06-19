<template>
  <div
    :title="title"
    class="day relative border-gray-400 hover:bg-gray-200"
    :class="dayClasses"
    :style="dayStyle"
    @click="triggerAction"
  >
    <div
      v-if="isToday"
      class="today-outline border border-blue-600"
    ></div>
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
    ...mapGetters({
      getStartingReservation: "apartment/getStartingReservation",
      getEndingReservation: "apartment/getEndingReservation",
      getInProgressReservation: "apartment/getInProgressReservation"
    }),
    startingReservation() {
      return this.getStartingReservation(this.day.dateEpoch.toString());
    },
    endingReservation() {
      return this.getEndingReservation(this.day.dateEpoch.toString());
    },
    inProgressReservation() {
      return this.getInProgressReservation(this.day.dateEpoch.toString());
    },
    title() {
      return this.day.date.toLocaleDateString();
    },
    dayOfMonth() {
      return this.day.date.getDate();
    },
    isToday() {
      return moment().isSame(this.day.date, "day");
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
<style scoped>
.today-outline {
  position: absolute;
  width: calc(100% + 1px);
  height: calc(100% + 1px);
}

.day {
  box-sizing: border-box;
  border-right-width: 1px;
}

.day:first-child {
  border-left-width: 1px;
}

.reservation-ribbon {
  background-color: #90cdf4;
  position: absolute;
  transform: translate(0px, 16px);
  height: 28px;
  width: calc(100% + 2px);

  transition: box-shadow 150ms ease-out;
}

.reservation-ribbon:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.35);
}

.reservation-ribbon.first-day {
  transform: translate(0px, 16px);
  width: calc(50% + 1px);
  left: 50%;
  border-top-left-radius: 2rem;
  border-bottom-left-radius: 2rem;
}

.reservation-ribbon.last-day {
  transform: translate(0px, 16px);
  width: calc(50% + 1px);
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
    transform: translate(0px, 8px);
    height: 22px;
  }

  .reservation-ribbon.first-day {
    transform: translate(0px, 8px);
  }

  .reservation-ribbon.last-day {
    transform: translate(0px, 8px);
  }

  .guest-icon {
    margin-top: 1px;
    margin-left: 1px;
    height: 20px;
    width: 20px;
  }
}
</style>
