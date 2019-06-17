<template>
  <div class="max-w-5xl w-full flex flex-col justify-center items-center md:pt-8 md:px-4">
    <toolbar>
      <r-field label="Search">
        <input
          class="input"
          placeholder="Search"
          type="text"
          @input="searchDebounced"
          @keyup.enter="searchImmediate"
        >
      </r-field>
    </toolbar>
    <template>
      <div class="container flex justify-start items-end mt-4">
        <button
          class="text-gray-600 ml-1 mr-0 font-semibold hover:text-gray-800"
          @click="createDocument"
        ><i class="pr-2 fas fa-plus"></i> New document</button>
        <button
          class="text-gray-600 ml-auto mr-0 hover:text-gray-800"
          @click="getDocuments"
        ><i class="pr-4 fas fa-sync"></i></button>
      </div>
      <div
        v-if="filteredDocuments.length > 0"
        class="container mt-4"
      >
        <div
          v-for="d in filteredDocuments"
          :key="d.id"
          class="w-full flex items-center h-12 px-4 mb-2 rounded bg-gray-200 shadow-md text-md"
        >
          <span class="max-w-64 block font-semibold text-gray-800 px-4">{{d.title}}</span>
          <span class="max-w-64 block font-semibold italic text-xs text-gray-800 px-4 ml-auto">{{d.fileName}} {{d.fileExtension}}</span>

          <span class="block font-semibold text-xs text-gray-800 mr-4">{{d.uploadDate | date}}</span>

          <div>
            <a
              title="Download"
              class="w-6 h-full text-sm text-gray-600 ml-4 hover:text-gray-800"
              :href="`/api/documents/${d.id}`"
            ><i class="fas fa-download"></i></a>
            <button
              title="Edit"
              class="w-6 h-full text-sm text-gray-600 ml-4 hover:text-gray-800"
              @click="editDocument(d)"
            ><i class="fas fa-pen"></i></button>
            <button
              title="Delete"
              class="w-6 h-full text-sm text-gray-600 ml-4 hover:text-gray-800"
              @click="tryDeleteDocument(d)"
            ><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="filteredDocuments.length == 0"
      class="container flex justify-center mt-16"
    >
      <p class="text-xl text-gray-600"><span class="icon pr-2"><i class="fas fa-frown"></i></span> No documents found</p>
    </div>
    <document-form
      :visible="showForm"
      @close="closeDocumentForm"
      :document="selected"
    />
  </div>
</template>
<script>
import { mapState, mapActions } from "vuex";
import FormattingFilters from "@/mixins/FormattingFilters";
import TextSearch from "@/mixins/TextSearch";
import DocumentForm from "@/components/document/DocumentForm";
import RField from "@/components/shared/RField";
import RSelect from "@/components/shared/RSelect";
import Toolbar from "@/components/shared/Toolbar";

export default {
  name: "DocumentList",
  components: {
    DocumentForm,
    Toolbar,
    RField,
    RSelect
  },
  mixins: [FormattingFilters, TextSearch],
  data() {
    return {
      selectedDate: new Date(),
      selected: null,
      showForm: false
    };
  },
  computed: {
    ...mapState({
      documents: state => state.apartment.documents
    }),
    filteredDocuments() {
      let result = this.documents;
      if (this.searchQuery) {
        result = result.filter(this.fieldFilter);
      }
      return result;
    }
  },
  methods: {
    ...mapActions({
      getDocuments: "apartment/getDocuments",
      deleteDocument: "apartment/deleteDocument"
    }),
    createDocument() {
      this.selected = null;
      this.showForm = true;
    },
    editDocument(document) {
      this.selected = document;
      this.showForm = true;
    },
    async tryDeleteDocument(document) {
      await this.deleteDocument(document.id);
    },
    closeDocumentForm() {
      this.selected = null;
      this.showForm = false;
    }
  }
};
</script>
<style scoped>
</style>
