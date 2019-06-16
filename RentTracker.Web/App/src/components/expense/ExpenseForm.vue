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
        class="m-6 flex flex-row flex-wrap align-center justify-between"
      >
        <div class="w-full">
          <r-field label="Name">
            <input
              class="input"
              type="text"
              placeholder="Name"
              v-model="formData.name"
            >
          </r-field>
          <r-field label="Description">
            <textarea
              class="input h-24"
              type="text"
              placeholder="Description"
              v-model="formData.description"
            ></textarea>
          </r-field>
          <r-field label="Date">
            <date-input
              class="input"
              type="date"
              placeholder="Date"
              v-model="formData.date"
            />
          </r-field>
        </div>
        <div class="w-1/2">
          <r-field label="Amount">
            <currency-input
              placeholder="Amount"
              v-model="formData.amount"
              :currency="formData.currency"
            ></currency-input>
          </r-field>
        </div>
        <div class="w-1/2">
          <r-field label="Currency">
            <r-select v-model="formData.currency">
              <option value="HRK">HRK</option>
              <option value="EUR">EUR</option>
            </r-select>
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
        <button
          class="btn btn-outline-secondary ml-auto"
          @click="close"
        >Cancel</button>
      </div>
    </template>
  </r-modal>

</template>
<script>
import { mapActions } from "vuex";
import RField from "@/components/shared/RField";
import RModal from "@/components/shared/RModal";
import RSelect from "@/components/shared/RSelect";
import DateInput from "@/components/shared/DateInput";
import CurrencyInput from "@/components/shared/CurrencyInput";
import FormattingFilters from "@/mixins/FormattingFilters";
import * as moment from "moment";

export default {
  name: "ExpenseForm",
  components: { RField, RModal, RSelect, DateInput, CurrencyInput },
  mixins: [FormattingFilters],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    expense: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: null
    };
  },
  computed: {
    title() {
      return this.expense ? this.expense.name : "New expense";
    }
  },
  watch: {
    expense: {
      immediate: true,
      handler: function(expense) {
        this.formData = expense
          ? { ...expense }
          : {
              name: "",
              description: "",
              date: new Date(),
              amount: 0.0,
              currency: "HRK"
            };
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateExpense"
    }),
    close() {
      this.$emit("close");
    },
    async trySave() {
      try {
        await this.createOrUpdate(this.formData);

        this.close();
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
