<template>
  <div class="calendar w-full flex flex-col justify-center items-center pt-8 px-4">
    <div class="container flex pb-4 mb-4">
      <p class="text-gray-800 text-2xl">Linked calendars</p>
      <router-link
        to="/calendar"
        class="btn-link h-8 ml-auto"
      >Calendar</router-link>
    </div>
    <div class="container flex justify-start items-end">
      <button
        class="text-gray-600 ml-1 mr-0 hover:text-gray-800"
        @click="createLinkedCalendar"
      ><i class="pr-2 fas fa-plus"></i></button>
      <button
        class="text-gray-600 ml-auto mr-0 hover:text-gray-800"
        @click="getLinkedCalendars"
      ><i class="pr-4 fas fa-sync"></i></button>
    </div>
    <div class="container mt-4">
      <div
        v-for="lc in linkedCalendars"
        :key="lc.id"
        class="w-full flex items-center h-12 px-4 mb-2 rounded bg-gray-200 shadow-md text-md"
      >
        <span class="w-1/3 block font-semibold text-gray-800">{{lc.name}}</span>
        <a
          class="w-2/3 block mr-6 text-right text-blue-600 italic hover:underline"
          :href="lc.url"
        >Link</a>
        <button
          title="Edit"
          class="w-6 h-full text-xs text-gray-600 ml-4 hover:text-gray-800"
          @click="editLinkedCalendar(lc)"
        ><i class="fas fa-pen"></i></button>
        <button
          title="Delete"
          class="w-6 h-full text-xs text-gray-600 ml-4 hover:text-gray-800"
          @click="tryDeleteLinkedCalendar(lc)"
        ><i class="fas fa-trash"></i></button>
        <button></button>
        <button
          title="Sync reservations"
          class="w-6 h-full text-xs text-gray-600 ml-4 hover:text-gray-800"
          @click="trySyncLinkedCalendar(lc)"
        ><i class="fas fa-sync"></i></button>
        <button></button>
      </div>
    </div>
    <linked-calendar-form
      :visible="showLinkedCalendarForm"
      @close="closeLinkedCalendarForm"
      :linked-calendar="selectedLinkedCalendar"
    />
  </div>
</template>
<script>
import RField from "@/components/shared/RField";
import LinkedCalendarForm from "@/components/calendar/LinkedCalendarForm";
import { mapState, mapActions } from "vuex";

export default {
  name: "LinkedCalendars",
  mounted() {
    this.getLinkedCalendars();
  },
  components: {
    RField,
    LinkedCalendarForm
  },
  data() {
    return {
      showLinkedCalendarForm: false,
      selectedLinkedCalendar: null
    };
  },
  computed: {
    ...mapState({
      linkedCalendars: state => state.apartment.linkedCalendars
    })
  },
  methods: {
    ...mapActions({
      getLinkedCalendars: "apartment/getLinkedCalendars",
      deleteLinkedCalendar: "apartment/deleteLinkedCalendar",
      syncLinkedCalendar: "apartment/syncLinkedCalendar"
    }),
    createLinkedCalendar() {
      this.selectedLinkedCalendar = null;
      this.showLinkedCalendarForm = true;
    },
    editLinkedCalendar(linkedCalendar) {
      this.selectedLinkedCalendar = linkedCalendar;
      this.showLinkedCalendarForm = true;
    },
    async tryDeleteLinkedCalendar(linkedCalendar) {
      await this.deleteLinkedCalendar(linkedCalendar.id);
    },
    async trySyncLinkedCalendar(linkedCalendar) {
      await this.syncLinkedCalendar(linkedCalendar.id);
    },
    closeLinkedCalendarForm() {
      this.selectedLinkedCalendar = null;
      this.showLinkedCalendarForm = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.btn-link:hover {
  padding-bottom: 2px;
  border-bottom-width: 2px;
}
</style>
