<template>
  <div class="flex justify-center items-center p-2 md:p-4">
    <router-view v-if="activeApartment"></router-view>
    <div
      class="mt-12"
      v-else
    >
      <h1 class="text-gray-900">Please pick an apartment to see the expenses</h1>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "ExpensesView",
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment
    })
  },
  watch: {
    activeApartment: {
      immediate: true,
      handler: function(apartment) {
        if (apartment) {
          this.getExpenses(apartment.id);
        }
      }
    }
  },
  methods: {
    ...mapActions({
      getExpenses: "apartment/getExpenses"
    })
  }
};
</script>
<style lang="scss" scoped>
</style>
