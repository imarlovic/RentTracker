<template>
  <div class="h-full flex flex-col flex-grow md:p-4">
    <loading-indicator v-if="isLoading"></loading-indicator>
    <div
      v-else
      class="flex flex-wrap items-center"
    >
      <div
        v-if="!activeApartment"
        class="w-full px-6 py-4 text-xl font-semibold text-gray-700"
      >Select an apartment to continue</div>

      <apartment-card
        v-for="apartment in apartments"
        :key="apartment.id"
        :apartment="apartment"
        @apartment:edit="editApartment"
      ></apartment-card>
    </div>
    <div class="mt-auto flex justify-center px-2">
      <r-field>
        <button
          class="btn btn-outline-primary"
          @click="newApartment"
        ><span class="icon pr-2"><i class="fas fa-plus"></i></span>New apartment</button>
      </r-field>
    </div>
    <apartment-form
      :visible="showForm"
      :apartment="selectedApartment"
      @close="closeForm"
      @apartment:saved="apartmentSaved"
    ></apartment-form>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import ApartmentCard from "@/components/cards/ApartmentCard";
import ApartmentForm from "@/components/apartment/ApartmentForm";
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import RField from "@/components/shared/RField";

export default {
  name: "ApartmentsView",
  components: {
    RField,
    LoadingIndicator,
    ApartmentCard,
    ApartmentForm
  },
  mounted() {
    this.getApartments();
  },
  data() {
    return {
      selectedApartment: null,
      showForm: false
    };
  },
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment,
      isLoading: state => state.global.status.apartment.loading,
      apartments: state => state.global.apartments
    })
  },
  methods: {
    ...mapActions({
      getApartments: "global/getApartments"
    }),
    closeForm() {
      this.showForm = false;
      this.selectedApartment = null;
    },
    newApartment() {
      this.selectedApartment = null;
      this.showForm = true;
    },
    editApartment(apartment) {
      this.selectedApartment = apartment;
      this.showForm = true;
    },
    apartmentSaved(apartment) {
      this.selectedApartment = null;
      this.showForm = false;
      this.getApartments();
    }
  }
};
</script>
<style scoped>
.placeholder-new {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24rem;
  width: 24rem;
}
</style>
