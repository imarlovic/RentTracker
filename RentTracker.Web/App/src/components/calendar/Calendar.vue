<template>
  <div class="max-w-5xl w-full">
    <toolbar>
      <month-selector v-model="selectedDate"></month-selector>
      <r-field class="hidden md:block ml-auto">
        <router-link
          to="/calendar/linked"
          class="btn-link"
        >Linked calendars</router-link>
      </r-field>
    </toolbar>
    <div class="flex justify-center">
      <div class="container mt-4">
        <div
          v-for="week in weeks"
          :key="week.weekOfYear"
          class="week"
        >
          <day
            v-for="day in week.days"
            :key="day.dayOfYear"
            :day="day"
            @trigger:new="newReservation"
            @reservation:selected="openReservation"
          />
        </div>
      </div>
    </div>

    <reservation-form
      :visible="reservationFormVisible"
      @close="closeReservationForm"
      :reservation="selectedReservation"
      :datehint="datehint"
    />

  </div>
</template>
<script>
import * as moment from "moment";
import RField from "@/components/shared/RField";
import Toolbar from "@/components/shared/Toolbar";
import MonthSelector from "@/components/shared/MonthSelector";
import ReservationForm from "@/components/reservation/ReservationForm";
import Day from "@/components/calendar/Day";

export default {
  name: "Calendar",
  components: {
    RField,
    Toolbar,
    MonthSelector,
    ReservationForm,
    Day
  },
  data() {
    return {
      datehint: null,
      selectedDate: new Date(),
      selectedReservation: null,
      reservationFormVisible: false
    };
  },
  computed: {
    weeks() {
      let selectedMonth = this.selectedDate.getMonth();
      let selectedYear = this.selectedDate.getFullYear();
      let month = selectedMonth;

      let startOfMonth = moment()
        .year(selectedYear)
        .month(selectedMonth)
        .startOf("month");
      let startOfWeek = startOfMonth.startOf("week");

      let weeks = [];
      while (month === selectedMonth) {
        weeks.push({
          days: [0, 1, 2, 3, 4, 5, 6].map(day => {
            let _date = moment(startOfWeek).add(day, "d");

            return {
              dayOfYear: _date.dayOfYear(),
              date: _date.toDate(),
              isCurrentMonth: _date.get("month") === selectedMonth
            };
          }),
          weekOfYear: startOfWeek.week()
        });
        startOfWeek = moment(startOfWeek).add(7, "d");
        month = moment(startOfWeek).get("month");
      }
      return weeks;
    }
  },
  methods: {
    newReservation(date) {
      this.datehint = date;
      this.reservationFormVisible = true;
    },
    openReservation(reservation) {
      this.selectedReservation = reservation;
      this.reservationFormVisible = true;
    },
    closeReservationForm() {
      this.reservationFormVisible = false;
      this.selectedReservation = null;
    }
  }
};
</script>
<style>
.week {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 5rem;
  display: flex;
  justify-content: space-around;
  align-items: center;

  /* line-height: 30px; */
}

.day {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-basis: 1rem;
  flex-grow: 1;
  height: 100%;
}

@media only screen and (max-width: 640px) {
  .week {
    height: initial;
  }
  .day {
    flex: 1 0 auto;
    height: auto;
  }

  .day:before {
    content: "";
    padding-top: 100%;
  }
}

.btn-link:hover {
  padding-bottom: 2px;
  border-bottom-width: 2px;
}
</style>
