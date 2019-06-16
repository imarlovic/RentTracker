<template>
  <div class="flex p-4">
    <apartment-card
      v-for="apartment in apartments"
      :key="apartment.id"
      :apartment="apartment"
      @apartment:edit="editApartment"
    ></apartment-card>

    <apartment-form
      :visible="selectedApartment !== null"
      :apartment="selectedApartment"
      @close="selectedApartment = null"
      @apartment:saved="apartmentSaved"
    ></apartment-form>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import ApartmentCard from "@/components/cards/ApartmentCard";
import ApartmentForm from "@/components/apartment/ApartmentForm";

export default {
  name: "ApartmentsView",
  components: {
    ApartmentCard,
    ApartmentForm
  },
  mounted() {
    this.getApartments();
  },
  data() {
    return {
      selectedApartment: null
    };
  },
  computed: {
    ...mapState({
      apartments: state => state.global.apartments
    })
  },
  methods: {
    ...mapActions({
      getApartments: "global/getApartments"
    }),
    editApartment(apartment) {
      this.selectedApartment = apartment;
    },
    apartmentSaved(apartment) {
      this.selectedApartment = null;

      this.getApartments();
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
