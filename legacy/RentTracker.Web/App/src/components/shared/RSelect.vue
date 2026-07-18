<template>
  <div class="select">
    <select
      name="select"
      v-model="computedValue"
      v-bind="$attrs"
      class="font-inherit appearance-none"
    >
      <template v-if="placeholder">
        <option
          v-if="computedValue == null"
          :value="null"
          disabled
          hidden
        >
          {{ placeholder }}
        </option>
      </template>
      <slot />
    </select>
    <div class="pointer-events-none absolute right-0 inset-y-0 flex items-center px-2 text-gray-700">
      <svg
        class="fill-current h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
    </div>
  </div>
</template>
<script>
export default {
  name: "RSelect",
  props: {
    value: {
      type: [String, Number, Boolean, Object, Array, Symbol, Function],
      default: null
    },
    placeholder: String
  },
  data() {
    return {
      selected: this.value
    };
  },
  computed: {
    computedValue: {
      get() {
        return this.selected;
      },
      set(value) {
        console.log(value);
        this.selected = value;
        this.$emit("input", value);
      }
    }
  },
  watch: {
    /**
     * When v-model is changed:
     *   1. Set the selected option.
     *   2. If it's invalid, validate again.
     */
    value(value) {
      this.selected = value;
    }
  }
};
</script>
<style>
.select select {
  padding-left: 0.75rem;
  padding-right: calc(0.75rem + 1.25rem);
  flex-grow: 1;
  appearance: none;
  outline: none;
  background-color: inherit;
}
</style>
