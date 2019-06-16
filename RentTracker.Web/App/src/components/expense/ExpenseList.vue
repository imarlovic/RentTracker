<template>
  <div class="max-w-5xl w-full flex flex-col justify-center items-center md:pt-8 md:px-4">
    <toolbar>
      <month-selector v-model="selectedDate"></month-selector>
    </toolbar>
    <div class="container flex justify-start items-end mt-4">
      <button
        class="text-gray-600 ml-1 mr-0 hover:text-gray-800"
        @click="createExpense"
      ><i class="pr-2 fas fa-plus"></i></button>
      <button
        class="text-gray-600 ml-auto mr-0 hover:text-gray-800"
        @click="getExpenses"
      ><i class="pr-4 fas fa-sync"></i></button>
    </div>
    <div class="container mt-4">
      <div
        v-for="e in expenses"
        :key="e.id"
        class="w-full flex items-center h-12 px-4 mb-2 rounded bg-gray-200 shadow-md text-md"
      >
        <span class="max-w-64 block font-semibold text-gray-800 px-4">{{e.name}}</span>
        <span
          class="max-w-64 block font-semibold text-gray-800 px-4"
          :title="e.description"
        >{{e.description}}</span>
        <span class="ml-auto block font-semibold text-gray-800 px-4">{{e.amount | money(e.currency)}}</span>
        <span class="block font-semibold text-gray-800">{{e.date | date}}</span>
        <div>
          <button
            title="Edit"
            class="w-6 h-full text-xs text-gray-600 ml-4 hover:text-gray-800"
            @click="editExpense(e)"
          ><i class="fas fa-pen"></i></button>
          <button
            title="Delete"
            class="w-6 h-full text-xs text-gray-600 ml-4 hover:text-gray-800"
            @click="tryDeleteExpense(e)"
          ><i class="fas fa-trash"></i></button>
        </div>
      </div>
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
import ExpenseForm from "@/components/expense/ExpenseForm";
import RField from "@/components/shared/RField";
import RSelect from "@/components/shared/RSelect";
import Toolbar from "@/components/shared/Toolbar";
import MonthSelector from "@/components/shared/MonthSelector";

export default {
  name: "ExpenseList",
  components: {
    ExpenseForm,
    Toolbar,
    MonthSelector,
    RField,
    RSelect
  },
  mixins: [FormattingFilters],
  data() {
    return {
      selectedDate: new Date(),
      selectedExpense: null,
      showExpenseForm: false
    };
  },
  computed: {
    ...mapState({
      expenses: state => state.apartment.expenses
    })
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
