<template>
  <div
    class="apartment-card w-full sm:max-w-sm cursor-pointer flex p-4"
    :class="{ 'active' : isActive}"
  >
    <div class="card-body w-full relative rounded overflow-hidden shadow-lg hover:shadow-xl">
      <img
        class="w-full"
        :src="apartment.headerUrl"
        alt="Sunset in the mountains"
        @click="selectApartment(apartment)"
      >
      <div class="py-2 px-4 pb-0">
        <div class="font-bold text-xl mb-2 text-gray-700">{{apartment.name}}</div>
      </div>
      <div class="flex justify-start items-center pl-4 pr-2 py-2">
        <button
          v-if="!isActive"
          class="btn btn-primary size-sm mr-2"
          @click="selectApartment(apartment)"
        ><span class="icon pr-2"><i class="fas fa-map-marker-alt"></i></span>Select</button>
        <button
          class="btn btn-outline-secondary size-sm ml-auto"
          @click="openApartment(apartment)"
        ><i class="fas fa-pen"></i></button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState, mapMutations } from "vuex";

export default {
  name: "ApartmentCard",
  props: {
    apartment: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState({
      activeApartment: state => state.global.activeApartment
    }),
    isActive() {
      return (
        this.activeApartment && this.activeApartment.id === this.apartment.id
      );
    }
  },
  methods: {
    ...mapMutations({
      setActiveApartment: "global/setActiveApartment"
    }),
    openApartment(apartment) {
      this.$emit("apartment:edit", apartment);
    },
    selectApartment(apartment) {
      this.setActiveApartment(apartment);
      this.$router.push("/");
    }
  }
};
</script>
<style lang="scss" scoped>
.apartment-card.active > .card-body {
  border: 1px solid gray;
}

.apartment-card {
  transition: transform 150ms ease-in;
}

.apartment-card:hover {
  // transform: translateY(-3px);
}

.apartment-card:hover:not(.active) .card-body img {
  filter: opacity(1);
}

.apartment-card:not(.active) .card-body img {
  filter: opacity(0.8);
}

.apartment-card .card-body img {
  transition: filter 150ms ease-in;
}

.action-btn {
  height: 2.5rem;
  width: 2.5rem;
  font-size: 1.5rem;
  padding: 0.25rem;
  line-height: 1;
  border: none;
  position: absolute;
  right: 0;
  margin: 0.5rem;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.action-btn:hover {
  opacity: 1;
  color: white;
}

.action-btn.active .icon {
  text-shadow: 0px 0px 30px black;
  transform: rotate(45deg);
  color: rgba(255, 255, 255, 1);
}
</style>
