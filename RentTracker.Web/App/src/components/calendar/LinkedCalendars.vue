<template>
  <loading-indicator v-if="isLoading"></loading-indicator>
  <div
    v-else
    class="max-w-5xl w-full flex flex-col justify-center items-center pt-4 md:pt-8 xl:px-4"
  >
    <div class="container flex pb-4 mb-4 px-2">
      <p class="text-gray-700 text-2xl">Linked calendars</p>
      <router-link
        to="/calendar"
        class="btn-link h-8 ml-auto"
      >Calendar</router-link>
    </div>
    <div class="container flex justify-start items-end">
      <button
        class="text-gray-600 ml-1 mr-0 hover:text-gray-800"
        @click="createLinkedCalendar"
      ><i class="pr-2 fas fa-plus"></i>New Linked Calendar</button>
      <button
        class="text-gray-600 ml-auto mr-0 hover:text-gray-800"
        :class="{ 'rotate': isLoading }"
        @click="getLinkedCalendars"
      ><i class="pr-4 fas fa-sync"></i></button>
    </div>
    <div
      v-if="linkedCalendars.length > 0"
      class="min-w-full container mt-4"
    >
      <div
        v-for="lc in linkedCalendars"
        :key="lc.id"
        class="w-full flex items-center h-20 md:h-12 px-4 mb-2 rounded bg-gray-200 shadow-md text-xs md:text-sm xl:text-md"
      >

        <div class="md:w-full flex flex-col md:flex-row  items-start justify-end">
          <span class="block font-semibold text-gray-800">{{lc.name}}</span>
          <span class="ml-auto md:px-2 pr-4 text-xs text-gray-700">Last updated: {{lc.lastUpdated | timeSince }}</span>
        </div>
        <div class="flex ml-auto md:ml-0">
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
            :class="{ 'rotate': syncing.includes(lc.id) }"
            @click="trySyncLinkedCalendar(lc)"
            :disabled="syncing.includes(lc.id)"
          ><i class="fas fa-sync"></i></button>
          <button></button>
        </div>
      </div>
    </div>
    <div
      v-if="linkedCalendars.length == 0"
      class="container flex justify-center mt-16"
    >
      <p class="text-xl text-gray-600"><span class="icon pr-2"><i class="fas fa-frown"></i></span> No linked calendars found</p>
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
import LoadingIndicator from "@/components/shared/LoadingIndicator";
import FormattingFilters from "@/mixins/FormattingFilters";
import { mapState, mapActions } from "vuex";

export default {
  name: "LinkedCalendars",
  mounted() {
    this.getLinkedCalendars();
  },
  mixins: [FormattingFilters],
  components: {
    RField,
    LoadingIndicator,
    LinkedCalendarForm
  },
  data() {
    return {
      syncing: [],
      showLinkedCalendarForm: false,
      selectedLinkedCalendar: null
    };
  },
  computed: {
    ...mapState({
      isLoading: state => state.apartment.status.linkedCalendar.loading,
      linkedCalendars: state => state.apartment.linkedCalendars
    })
  },
  methods: {
    ...mapActions({
      getLinkedCalendars: "apartment/getLinkedCalendars",
      deleteLinkedCalendar: "apartment/deleteLinkedCalendar",
      syncLinkedCalendar: "apartment/syncLinkedCalendar",
      getLinkedCalendars: "apartment/getLinkedCalendars"
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
      try {
        this.syncing.push(linkedCalendar.id);
        await this.syncLinkedCalendar(linkedCalendar.id);
        await this.getLinkedCalendars();
      } finally {
        this.syncing = this.syncing.filter(id => id !== linkedCalendar.id);
      }
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
