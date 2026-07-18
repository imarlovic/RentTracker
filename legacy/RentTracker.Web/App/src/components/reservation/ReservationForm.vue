<template>
  <r-modal
    :active="visible"
    @close="close"
  >
    <template v-slot:header>
      <p class="ml-6 my-3 font-bold  text-xl text-gray-700">{{title}}</p>
    </template>

    <template v-slot:default>
      <div
        v-if="formData"
        class="flex flex-row flex-wrap align-center justify-between p-3"
      >
        <div class="w-full flex flex-wrap">
          <r-field
            label="Reservation Reference"
            class="w-full md:w-1/2"
          >
            <input
              class="input"
              type="text"
              placeholder="Reservation Reference"
              readonly
              :value="formData.reference"
            >
          </r-field>
          <r-field
            label="Holding name"
            class="w-full md:w-1/2"
          >
            <input
              class="input"
              type="text"
              placeholder="Holding name"
              v-model="formData.holdingName"
            >
          </r-field>
        </div>
        <div class="w-full flex flex-wrap">
          <r-field
            label="Price"
            class="w-full md:w-1/2"
          >
            <currency-input
              placeholder="Price"
              v-model="formData.price"
              :currency="formData.currency"
            ></currency-input>
          </r-field>
          <r-field
            label="Currency"
            class="w-full md:w-1/2"
          >
            <r-select v-model="formData.currency">
              <option value="HRK">HRK</option>
              <option value="EUR">EUR</option>
            </r-select>
          </r-field>
        </div>
        <div class="w-full flex flex-wrap">
          <r-field
            label="Source"
            class="w-full md:w-1/2"
          >
            <input
              class="input"
              type="text"
              placeholder="Source"
              readonly
              :value="formData.source"
            >
          </r-field>
          <r-field
            label="Country"
            class="w-full md:w-1/2"
          >
            <input
              class="input"
              type="text"
              placeholder="Country"
              v-model="formData.country"
            >
          </r-field>
        </div>
        <div class="w-full flex flex-wrap mt-4">
          <r-field
            label="Adults"
            class="w-full md:w-1/3"
          >
            <input
              class="input"
              type="number"
              step="1"
              min="0"
              placeholder="Adults"
              v-model="formData.adults"
            >
          </r-field>
          <r-field
            label="Children"
            class="w-full md:w-1/3"
          >
            <input
              class="input"
              type="number"
              step="1"
              min="0"
              placeholder="Children"
              v-model="formData.children"
            >
          </r-field>
          <r-field
            label="Infants"
            class="w-full md:w-1/3"
          >
            <input
              class="input"
              type="number"
              step="1"
              min="0"
              placeholder="Infants"
              v-model="formData.infants"
            >
          </r-field>
        </div>
        <div class="w-full flex justify-between mt-4">
          <r-field
            label="Check-in"
            class="w-2/5"
          >
            <date-input
              class="input"
              type="date"
              :max="maxStartingDate"
              placeholder="Check-in"
              v-model="formData.startDate"
            />
          </r-field>
          <r-field
            label="Check-out"
            class="w-2/5"
          >
            <date-input
              class="input"
              type="date"
              :min="minEndingDate"
              placeholder="Check-out"
              v-model="formData.endDate"
            />
          </r-field>
          <r-field
            class="w-1/5"
            label="Days"
          >
            <input
              class="input"
              type="text"
              placeholder="Days"
              readonly
              :value="days"
            >
          </r-field>
        </div>
      </div>

    </template>
    <template v-slot:footer>
      <div class="m-3 flex flex-row justify-end items-center">
        <button
          class="btn btn-primary"
          @click="trySave"
        ><span class="icon"><i class="fas fa-save"></i></span> Save</button>
        <div class="flex ml-auto">
          <button
            class="btn btn-outline-secondary mx-1"
            @click="close"
          >Cancel</button>
          <button
            v-if="deleteAllowed"
            class="btn btn-outline-danger mx-1"
            @click="tryDelete"
          ><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </template>
  </r-modal>

</template>
<script>
import { mapActions } from "vuex";
import RField from "@/components/shared/RField";
import RSelect from "@/components/shared/RSelect";
import RModal from "@/components/shared/RModal";
import DateInput from "@/components/shared/DateInput";
import CurrencyInput from "@/components/shared/CurrencyInput";
import FormattingFilters from "@/mixins/FormattingFilters";
import * as moment from "moment";

export default {
  name: "ReservationForm",
  components: { RField, RSelect, RModal, DateInput, CurrencyInput },
  mixins: [FormattingFilters],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    reservation: {
      type: Object,
      default: null
    },
    datehint: {
      type: Date,
      default: new Date()
    }
  },
  data() {
    return {
      formData: null
    };
  },
  computed: {
    maxStartingDate() {
      if (this.formData.endDate) {
        return moment(this.formData.endDate)
          .subtract(1, "days")
          .format("YYYY-MM-DD");
      }
    },
    minEndingDate() {
      if (this.formData.startDate) {
        return moment(this.formData.startDate)
          .add(1, "days")
          .format("YYYY-MM-DD");
      }
    },
    title() {
      let r = this.reservation;

      if (r) {
        let start = moment(r.startDate).format("DD.MM.");
        let end = moment(r.endDate).format("DD.MM.YYYY.");
        return `${r.holdingName} - ${start} - ${end}`;
      } else {
        return "New reservation";
      }
    },
    days() {
      let days =
        this.formData && this.formData.startDate && this.formData.endDate
          ? moment(this.formData.endDate).diff(
              moment(this.formData.startDate),
              "days"
            )
          : 0;

      return days;
    },
    deleteAllowed() {
      return (
        this.reservation &&
        this.reservation.source === "RentTracker" &&
        this.reservation.id
      );
    }
  },
  watch: {
    reservation: {
      immediate: true,
      handler: function(reservation) {
        this.formData = reservation
          ? { ...reservation }
          : {
              reference: `RT-${moment(this.datehint).format("YYYYMMDD")}`,
              source: "RentTracker",
              amount: 0.0,
              currency: "HRK",
              adults: 1,
              children: 0,
              infants: 0
            };
      }
    },
    "formData.startDate": {
      handler: function(date) {
        if (moment(date).isValid() && this.formData.source === "RentTracker") {
          this.$set(
            this.formData,
            "reference",
            `RT-${moment(date).format("YYYYMMDD")}`
          );
        }
      }
    },
    datehint: {
      immediate: true,
      handler: function(date) {
        if (!this.reservation) {
          let startDate = moment(this.datehint).toDate();
          let endDate = moment(this.datehint)
            .add(1, "days")
            .toDate();

          this.$set(this.formData, "startDate", startDate);

          this.$set(this.formData, "endDate", endDate);
        }
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateReservation",
      delete: "apartment/deleteReservation"
    }),
    async tryDelete() {
      let confirmation = confirm(
        "Please confirm you want to delete the reservation."
      );
      if (confirmation) {
        await this.delete(this.reservation.id);
        this.close();
      }
    },
    async trySave() {
      try {
        await this.createOrUpdate(this.formData);

        this.close();
      } catch (e) {
        console.log(e);
      }
    },
    close() {
      this.$emit("close");
    }
  }
};
</script>
