<template>
  <div
    class="apartment-card cursor-pointer flex p-4"
    :class="{ 'active' : isActive}"
  >
    <div
      class="card-body max-w-sm relative rounded overflow-hidden shadow-lg"
      @click="selectApartment(apartment)"
    >
      <button
        class="action-btn btn bg-gray-600"
        @click="openApartment(apartment)"
      ><i class="icon fas fa-pen"></i></button>
      <img
        class="w-full"
        :src="apartment.headerUrl"
        alt="Sunset in the mountains"
      >
      <div class="px-6 py-4">
        <div class="font-bold text-xl mb-2 text-gray-700">{{apartment.name}}</div>
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
      this.$router.push("/calendar");
    }
  }
};
</script>
<style lang="scss" scoped>
.apartment-card.active > .card-body {
  border: 1px solid gray;
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
