<template>
  <div class="input flex items-center">
    <input
      ref="input"
      class="date-input"
      type="date"
      placeholder="Check-in"
      :value="date"
      :min="min"
      :max="max"
      @input="parseDate($event.target.value)"
    >
    {{ date | date }}
  </div>
</template>
<script>
import * as moment from "moment";
import FormattingFilters from "@/mixins/FormattingFilters";

export default {
  name: "DateInput",
  inheritAttrs: true,
  mixins: [FormattingFilters],
  props: {
    min: {
      type: String,
      default: "1970-01-01"
    },
    max: {
      type: String,
      default: "2999-12-31"
    },
    value: {
      type: Date | String,
      default: new Date().toString()
    }
  },
  data() {
    return {
      date: this.value
    };
  },

  watch: {
    value: {
      immediate: true,
      handler: function(value) {
        this.date = value ? moment(value).format("YYYY-MM-DD") : new Date();
      }
    }
  },
  methods: {
    parseDate(date) {
      this.$emit("input", moment(date).toDate());
    }
  }
};
</script>
<style lang="scss" scoped>
.date-input {
  position: absolute;
  opacity: 0;
  height: 100%;
  width: 100%;
  left: 0rem;
}
</style>
