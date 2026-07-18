<template>
  <r-modal
    :active="visible"
    @close="close"
  >
    <template v-slot:header>
      <p class="ml-6 my-3 font-bold  text-xl text-gray-700">{{title}}</p>
    </template>

    <template v-slot:default>
      <div
        v-if="formData"
        class="m-6 flex flex-row flex-wrap align-center justify-between"
      >
        <div class="w-full">
          <r-field label="Title">
            <input
              class="input"
              type="text"
              placeholder="Title"
              v-model="formData.title"
            >
          </r-field>
          <r-field label="File">
            <!-- <input
              class="input"
              type="file"
              placeholder="File"
              @change="fileSelected"
            /> -->
            <file-input
              placeholder="File"
              v-model="formData.file"
            ></file-input>
          </r-field>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="m-3 flex flex-row justify-end items-center">
        <button
          class="btn btn-primary"
          :disabled="saving"
          @click="trySave"
        ><span class="icon"><i class="fas fa-save"></i></span> Save</button>
        <button
          class="btn btn-outline-secondary ml-auto"
          @click="close"
        >Cancel</button>
      </div>
    </template>
  </r-modal>

</template>
<script>
import { mapActions } from "vuex";
import RField from "@/components/shared/RField";
import RModal from "@/components/shared/RModal";
import RSelect from "@/components/shared/RSelect";
import DateInput from "@/components/shared/DateInput";
import FileInput from "@/components/shared/FileInput";
import CurrencyInput from "@/components/shared/CurrencyInput";
import FormattingFilters from "@/mixins/FormattingFilters";
import * as moment from "moment";

export default {
  name: "DocumentForm",
  components: { RField, RModal, RSelect, DateInput, FileInput, CurrencyInput },
  mixins: [FormattingFilters],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    document: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      saving: false,
      formData: null
    };
  },
  computed: {
    title() {
      return this.document ? this.document.title : "New document";
    }
  },
  watch: {
    document: {
      immediate: true,
      handler: function(document) {
        this.formData = document
          ? { ...document }
          : {
              title: "",
              file: null
            };
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateDocument"
    }),
    fileSelected(e) {
      this.formData.file = e.target.files[0];
    },
    close() {
      this.$emit("close");
    },
    async trySave() {
      try {
        this.saving = true;

        this.createOrUpdate(this.formData);

        this.close();
      } catch (e) {
        console.error(e);
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>
