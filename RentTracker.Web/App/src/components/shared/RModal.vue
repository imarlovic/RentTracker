<template>
  <div
    v-if="active"
    class="modal-container fixed top-0 right-0 w-screen h-screen overflow-auto flex flex-col justify-center items-center"
  >
    <div
      class="modal-backdrop absolute top-0 right-0 w-screen h-screen bg-gray-700 opacity-75"
      @click="close"
    ></div>
    <div
      class="modal-content max-w-full h-full md:h-auto flex flex-col bg-white rounded shadow-lg"
      :class="contentClass"
    >
      <div class="modal-header">
        <slot name="header"></slot>
      </div>
      <div class="modal-body flex-grow md:flex-grow-0">
        <slot />
      </div>
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "RModal",
  props: {
    active: {
      type: Boolean,
      required: true
    },
    size: {
      type: String,
      default: "md"
    }
  },
  computed: {
    contentClass() {
      let classArr = [];

      switch (this.size) {
        case "md":
          classArr.push("modal-size-md");
      }

      return classArr.join(" ");
    }
  },
  methods: {
    close() {
      this.$emit("close");
    }
  }
};
</script>
<style lang="scss" scoped>
.modal-container {
  z-index: 9000;
}

.modal-backdrop {
  z-index: 9010;
}

.modal-content {
  z-index: 9020;
}

.modal-header,
.modal-body,
.modal-footer {
  background-color: white;
  z-index: 9030;
  // min-height: 3rem;
}

.modal-content.modal-size-md {
  width: 36rem;
}
</style>
