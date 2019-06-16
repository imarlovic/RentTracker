<template>
  <input
    class="input"
    type="text"
    :value="formattedValue"
    @input="parseValue($event.target.value)"
    @focus="isEditing = true"
    @blur="isEditing = false"
    @keyup.enter="$event.target.blur()"
  >
</template>
<script>
import FormattingFilters from "@/mixins/FormattingFilters";
export default {
  name: "CurrencyInput",
  inheritAttrs: true,
  mixins: [FormattingFilters],
  props: {
    value: {
      type: Number,
      default: 0.0
    },
    currency: {
      type: String,
      default: "HRK"
    }
  },
  data() {
    return {
      isEditing: false
    };
  },

  computed: {
    formattedValue() {
      let value = this.value ? this.value : 0.0;

      return this.isEditing
        ? value.toString().replace(".", ",")
        : value.toLocaleString("hr-HR", {
            style: "currency",
            currency: this.currency
          });
    }
  },
  methods: {
    parseValue(value) {
      this.$emit("input", parseFloat(value.replace(",", ".")));
    }
  }
};
</script>
