<template>
  <div class="file input">
    <label class="text-lg">
      <span class="icon pr-4"><i class="fas fa-file-upload"></i></span>
      {{ this.file ? this.file.name : "Choose a file..."}}
    </label>
    <input
      type="file"
      @change="fileSelected"
    >
  </div>
</template>
<script>
export default {
  name: "FileInput",
  inheritAttrs: true,
  props: {
    value: {
      type: File,
      default: null
    }
  },
  data() {
    return {
      file: null
    };
  },
  methods: {
    fileSelected(e) {
      this.file = e.target.files[0];
      console.log(this.file);
      this.$emit("input", this.file);
    }
  }
};
</script>
<style scoped>
.file.input {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
}

.file.input > input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file.input label {
  display: block;
  width: calc(100% - 10px);
  overflow: hidden;
  cursor: pointer;
  white-space: nowrap;
}
</style>
