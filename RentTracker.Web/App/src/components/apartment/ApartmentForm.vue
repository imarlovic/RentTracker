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
              placeholder="Enter name"
              v-model="formData.name"
            >
          </r-field>

          <r-field label="Header Image">
            <file-input v-model="image"></file-input>
          </r-field>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="m-3 flex flex-row justify-end items-center">
        <button
          class="btn btn-primary"
          :disabled="submitting"
          @click="submit"
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
import axios from "axios";
import RField from "@/components/shared/RField";
import FileInput from "@/components/shared/FileInput";
import RModal from "@/components/shared/RModal";
import { mapActions } from "vuex";

export default {
  name: "ApartmentForm",
  components: { RField, FileInput, RModal },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    apartment: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitting: false,
      formData: null,
      image: null
    };
  },
  computed: {
    title() {
      return this.apartment ? this.apartment.name : "New apartment";
    }
  },
  watch: {
    apartment: {
      immediate: true,
      handler: function(apartment) {
        this.formData = apartment ? { ...apartment } : { name: "" };
        this.image = null;
      }
    }
  },
  methods: {
    ...mapActions({
      createOrUpdateApartment: "apartment/createOrUpdateApartment"
    }),
    close() {
      this.$emit("close");
    },
    imageSelected(e) {
      this.image = e.target.files[0];
    },
    async submit() {
      try {
        this.submitting = true;

        if (this.image) {
          let fd = new FormData();
          fd.append("image", this.image);

          if (this.formData.headerId) {
            await axios.put(`/api/img/${this.formData.headerId}`, fd, {
              headers: { "Content-Type": "multipart/form-data" }
            });
          } else {
            let imgResult = await axios.post("/api/img", fd, {
              headers: { "Content-Type": "multipart/form-data" }
            });

            this.formData.headerId = imgResult.data.id;
          }
        }

        let apartment = await this.createOrUpdateApartment(this.formData);

        this.$emit("apartment:saved", apartment);
      } catch (e) {
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>
