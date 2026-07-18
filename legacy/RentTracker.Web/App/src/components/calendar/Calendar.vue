<template>
  <loading-indicator v-if="isLoading"></loading-indicator>
  <div
    v-else
    class="max-w-5xl w-full"
  >
    <toolbar>
      <month-selector v-model="selectedDate"></month-selector>
      <r-field>
        <button
          v-if="linkedCalendars.length > 0"
          class="btn btn-outline-primary"
          @click="runSync"
          :disabled="syncInProgress"
        >
          <span class="icon"><i
              class="fas fa-sync"
              :class="{ 'rotate': syncInProgress }"
            ></i></span>
          Sync
        </button>
      </r-field>
      <r-field class="md:block ml-auto">
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
import { mapState, mapActions } from "vuex";
import * as moment from "moment";
import RField from "@/components/shared/RField";
import Toolbar from "@/components/shared/Toolbar";
import MonthSelector from "@/components/shared/MonthSelector";
import ReservationForm from "@/components/reservation/ReservationForm";
import Day from "@/components/calendar/Day";
import LoadingIndicator from "@/components/shared/LoadingIndicator";

export default {
  name: "Calendar",
  components: {
    RField,
    Toolbar,
    MonthSelector,
    ReservationForm,
    Day,
    LoadingIndicator
  },
  mounted() {
    this.getLinkedCalendars();
  },
  data() {
    return {
      syncInProgress: false,
      datehint: null,
      selectedDate: new Date(),
      selectedReservation: null,
      reservationFormVisible: false
    };
  },
  computed: {
    ...mapState({
      linkedCalendars: state => state.apartment.linkedCalendars,
      isLoading: state => state.apartment.status.reservation.loading
    }),
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
              dateEpoch: _date.toDate().valueOf(),
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
    ...mapActions({
      syncLinkedCalendar: "apartment/syncLinkedCalendar",
      getLinkedCalendars: "apartment/getLinkedCalendars"
    }),
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
    },
    runSync() {
      this.syncInProgress = true;

      let promises = this.linkedCalendars.map(lc =>
        this.syncLinkedCalendar(lc.id)
      );

      Promise.all(promises).finally(() => {
        this.syncInProgress = false;
      });
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
  border-bottom-width: 1px;
  /* line-height: 30px; */
}

.week:first-child {
  border-top-width: 1px;
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
