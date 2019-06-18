<template>
  <loading-indicator v-if="isLoading"></loading-indicator>
  <div
    v-else
    class="max-w-5xl w-full flex flex-col justify-center items-center sm:pt-4 md:pt-8 xl:px-4"
  >
    <toolbar>
      <month-selector v-model="selectedDate"></month-selector>
      <r-field label="Search">
        <input
          class="input"
          placeholder="Search"
          type="text"
          @input="searchDebounced"
          @keyup.enter="searchImmediate"
        >
      </r-field>
    </toolbar>
    <div class="min-w-full container flex justify-start items-end mt-4">
      <button
        class="text-gray-600 ml-1 mr-0 font-semibold hover:text-gray-800"
        @click="createExpense"
      ><i class="pr-2 fas fa-plus"></i>New expense</button>
      <button
        class="text-gray-600 ml-auto mr-0 hover:text-gray-800"
        @click="getExpenses"
      ><i class="pr-4 fas fa-sync"></i></button>
    </div>
    <div
      v-if="filteredExpenses.length > 0"
      class="min-w-full container mt-4"
    >
      <div
        v-for="e in filteredExpenses"
        :key="e.id"
        class="w-full flex items-center h-20 md:h-12 px-4 mb-2 rounded bg-gray-200 shadow-md text-xs md:text-sm xl:text-md"
      >
        <div class="flex flex-col md:flex-row">
          <span class="max-w-64 block font-bold md:font-semibold text-gray-800 px-4">{{e.name}}</span>
          <span
            class="max-w-64 block font-semibold text-gray-800 px-4"
            :title="e.description"
          >{{e.description}}</span>
        </div>
        <div class="flex flex-col md:flex-row ml-auto text-right">
          <span class="block font-semibold text-gray-800 md:px-4">{{e.amount | money(e.currency)}}</span>
          <span class="block font-semibold text-gray-800">{{e.date | date}}</span>
        </div>
        <div class="flex">
          <button
            title="Edit"
            class="w-6 h-full text-sm text-gray-600 ml-4 hover:text-gray-800"
            @click="editExpense(e)"
          ><i class="fas fa-pen"></i></button>
          <button
            title="Delete"
            class="w-6 h-full text-sm text-gray-600 ml-4 hover:text-gray-800"
            @click="tryDeleteExpense(e)"
          ><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
    <div
      v-if="filteredExpenses.length == 0"
      class="container flex justify-center mt-16"
    >
      <p class="text-xl text-gray-600"><span class="icon pr-2"><i class="fas fa-frown"></i></span> No expenses found</p>
    </div>
    <expense-form
      :visible="showExpenseForm"
      @close="closeExpenseForm"
      :expense="selectedExpense"
    />
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import FormattingFilters from "@/mixins/FormattingFilters";
import TextSearch from "@/mixins/TextSearch";
import ExpenseForm from "@/components/expense/ExpenseForm";
import RField from "@/components/shared/RField";
import Toolbar from "@/components/shared/Toolbar";
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import MonthSelector from "@/components/shared/MonthSelector";
import * as moment from "moment";
import debounce from "lodash.debounce";

export default {
  name: "ExpenseList",
  components: {
    ExpenseForm,
    Toolbar,
    LoadingIndicator,
    MonthSelector,
    RField
  },
  mixins: [FormattingFilters, TextSearch],
  data() {
    return {
      selectedDate: new Date(),
      selectedExpense: null,
      showExpenseForm: false
    };
  },
  computed: {
    ...mapState({
      isLoading: state => state.apartment.status.expense.loading,
      expenses: state => state.apartment.expenses
    }),
    filteredExpenses() {
      let result = this.expenses;

      if (this.searchQuery) {
        result = result.filter(this.fieldFilter);
      } else {
        result = result.filter(
          e =>
            moment(e.date).isSame(this.selectedDate, "year") &&
            moment(e.date).isSame(this.selectedDate, "month")
        );
      }

      return result;
    }
  },
  methods: {
    ...mapActions({
      getExpenses: "apartment/getExpenses",
      deleteExpense: "apartment/deleteExpense"
    }),
    createExpense() {
      this.selectedExpense = null;
      this.showExpenseForm = true;
    },
    editExpense(expense) {
      this.selectedExpense = expense;
      this.showExpenseForm = true;
    },
    async tryDeleteExpense(expense) {
      await this.deleteExpense(expense.id);
    },
    closeExpenseForm() {
      this.selectedExpense = null;
      this.showExpenseForm = false;
    }
  }
};
</script>
<style scoped>
</style>
