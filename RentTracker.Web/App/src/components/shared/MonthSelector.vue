<template>
  <div class="flex flex-wrap flex-row items-end">
    <r-field label="Year">
      <r-select v-model="year">
        <option :value="2020">2020</option>
        <option :value="2019">2019</option>
        <option :value="2018">2018</option>
        <option :value="2017">2017</option>
      </r-select>
    </r-field>
    <r-field label="Month">
      <r-select v-model="month">
        <option :value="0">1</option>
        <option :value="1">2</option>
        <option :value="2">3</option>
        <option :value="3">4</option>
        <option :value="4">5</option>
        <option :value="5">6</option>
        <option :value="6">7</option>
        <option :value="7">8</option>
        <option :value="8">9</option>
        <option :value="9">10</option>
        <option :value="10">11</option>
        <option :value="11">12</option>
      </r-select>
    </r-field>
    <r-field>
      <button
        class="btn mr-0 border-r-0 rounded-r-none"
        @click="previousMonth"
      ><i class="fas fa-angle-left"></i></button>
      <button
        class="btn ml-0 border-l-0 rounded-l-none"
        @click="nextMonth"
      ><i class="fas fa-angle-right"></i></button>
    </r-field>
    <r-field>
      <button
        class="btn"
        @click="reset"
      >Today</button>
    </r-field>
  </div>
</template>
<script>
import RField from "@/components/shared/RField";
import RSelect from "@/components/shared/RSelect";

export default {
  name: "MonthSelector",
  components: {
    RField,
    RSelect
  },
  props: {
    value: {
      type: Date,
      default: new Date()
    }
  },
  data() {
    return {
      year: this.value.getFullYear(),
      month: this.value.getMonth()
    };
  },
  watch: {
    year: function(year) {
      this.$emit("input", new Date(year, this.month, 1));
    },
    month: function(month) {
      this.$emit("input", new Date(this.year, month, 1));
    }
  },
  methods: {
    previousMonth() {
      if (this.month - 1 < 0) {
        this.year--;
        this.month = 11;
      } else {
        this.month--;
      }
    },
    nextMonth() {
      if (this.month + 1 > 11) {
        this.year++;
        this.month = 0;
      } else {
        this.month++;
      }
    },
    reset() {
      let today = new Date();
      this.year = today.getFullYear();
      this.month = today.getMonth();
    }
  }
};
</script>
