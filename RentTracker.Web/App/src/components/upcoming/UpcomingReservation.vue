<template>
  <div
    v-if="reservation"
    class="upcoming-reservation max-w-md w-full mx-2 md:mx-0"
    @click="detailed = !detailed"
  >
    <div class="rounded border border-gray-400 bg-white rounded-b p-4 flex flex-col justify-between leading-normal">
      <div class="mb-2">
        <div class="text-sm text-gray-600 flex items-center">

          <p class="text-gray-800 font-semibold text-xl">{{reservation.holdingName}}</p>
          <div class="ml-auto">
            <img
              v-if="hasLogo"
              class="w-24"
              :src="source_logo_urls[reservation.source]"
              alt=""
            >
            <span
              v-else
              class="icon pr-2"
            >
              <img
                :src="source_logo_urls[reservation.source]"
                alt=""
              >
              <i class="fas fa-certificate"></i>
              {{reservation.source}}
            </span>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="flex flex-col text-sm text-gray-800 font-semibold">
          <p><span class="pr-2">{{reservation.people}}</span><span>{{ "Guest" | pluralize(reservation.people)}}</span></p>
          <div
            v-show="detailed"
            class="text-sm text-gray-800 font-semibold"
          ><span class="pr-2">{{days}}</span><span>{{ "Day" | pluralize(days)}}</span></div>
        </div>
        <div
          v-show="!detailed"
          class="flex flex-col ml-auto"
        >
          <div class="text-sm text-gray-800 font-semibold"><span class="pr-2">{{days}}</span><span>{{ "Day" | pluralize(days)}}</span></div>

        </div>
        <div
          v-show="detailed"
          class="flex flex-col text-right ml-auto"
        >
          <div
            v-if="reservation.adults > 0"
            class="pl-2 text-sm text-gray-700 font-semibold"
          >
            <span class="pr-2">{{reservation.adults}}</span><span>{{ "Adult" | pluralize(reservation.adults)}}</span>
          </div>
          <div
            v-if="reservation.children > 0"
            class="pl-2 text-sm text-gray-700 font-semibold"
          >
            <span class="pr-2">{{reservation.children}}</span><span>{{ "Child" | pluralize(reservation.children)}}</span>
          </div>
          <div
            v-if="reservation.infants > 0"
            class="pl-2 text-sm text-gray-700 font-semibold"
          >
            <span class="pr-2">{{reservation.infants}}</span><span>{{ "Infant" | pluralize(reservation.infants)}}</span>
          </div>
        </div>
      </div>
      <div
        v-if="detailed"
        class="flex items-center mt-4"
      >
      </div>
      <div
        v-if="detailed"
        class="flex items-center mt-2"
      >
        <div class="text-gray-700 self-end text-sm pr-2">
          <span class="icon"><i class="fas fa-money-bill"></i></span>
        </div>
        <span class="text-gray-800 font-semibold text-md self-end">
          {{reservation.earnings | money(reservation.currency)}}
        </span>
        <div class="ml-auto text-gray-700 self-end text-sm pr-2">
          <span class="icon"><i class="fas fa-calendar-alt"></i></span>
        </div>
        <div class="text-sm text-gray-700 font-semibold mr-2">
          <p class="text-right pr-1">Check-in</p>
          <p class="font-normal">{{reservation.startDate | date}}</p>
        </div>

        <div class="text-gray-700 self-end text-sm pl-2 pr-2">
          <span class="icon"><i class="fas fa-calendar-alt"></i></span>
        </div>
        <div class="text-sm text-gray-700 font-semibold">
          <p class="text-right pr-1">Check-out</p>
          <p class="font-normal">{{reservation.endDate | date}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FormattingFilters from "@/mixins/FormattingFilters";
import * as moment from "moment";

export default {
  name: "UpcomingReservation",
  mixins: [FormattingFilters],
  props: {
    reservation: {
      type: Object | undefined,
      required: true
    }
  },
  data() {
    return {
      detailed: false,
      source_logo_urls: {
        Booking: "/img/logos/booking_logo.png",
        Airbnb: "/img/logos/airbnb_logo.png",
        RentTracker: "/img/logos/renttracker_logo.png"
      }
    };
  },
  computed: {
    days() {
      return this.reservation
        ? moment(this.reservation.endDate).diff(
            moment(this.reservation.startDate),
            "days"
          )
        : 0;
    },
    hasLogo() {
      return this.reservation
        ? this.source_logo_urls[this.reservation.source] !== undefined
        : false;
    }
  }
};
</script>
<style scoped>
.upcoming-reservation {
  transition: all 150ms ease-in;
}
</style>
