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
          <r-field label="Name">
            <input
              class="input"
              type="text"
              placeholder="Name"
              v-model="formData.name"
            >
          </r-field>
          <r-field label="Url">
            <input
              class="input"
              type="text"
              placeholder="Url"
              v-model="formData.url"
            >
          </r-field>
        </div>
      </div>

    </template>
    <template v-slot:footer>
      <div class="m-3 flex flex-row justify-end items-center">
        <button
          class="btn btn-primary"
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
import RField from "@/components/shared/RField";
import RModal from "@/components/shared/RModal";
import { mapActions } from "vuex";

export default {
  name: "LinkedCalendarForm",
  components: { RField, RModal },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    linkedCalendar: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: null
    };
  },
  computed: {
    title() {
      return this.linkedCalendar
        ? this.linkedCalendar.name
        : "New linked calendar";
    }
  },
  watch: {
    linkedCalendar: {
      immediate: true,
      handler: function(linkedCalendar) {
        this.formData = linkedCalendar
          ? { ...linkedCalendar }
          : {
              name: "",
              url: ""
            };
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdate: "apartment/createOrUpdateLinkedCalendar"
    }),
    close() {
      this.$emit("close");
    },
    async trySave() {
      try {
        await this.createOrUpdate(this.formData);

        this.close();
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>
