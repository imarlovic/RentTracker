<template>
  <div class="field">
    <label
      v-if="label"
      class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
    >
      {{label}}
    </label>
    <slot />
  </div>
</template>
<script>
export default {
  name: "RField",
  inheritAttrs: true,
  props: {
    label: {
      type: String,
      default: null
    }
  }
};
</script>
<style>
</style>
