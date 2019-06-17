<template>
  <div class="timeline-section min-w-full flex flex-col items-center">
    <div class="timeline-divider w-full flex flex-row items-center my-4">
      <span class="w-full h-1 border-b border-gray-600 flex-grow pt-1"></span>
      <span class="timeline-title text-gray-700 text-md px-4">{{title}}</span>
      <span class="w-full h-1 border-b border-gray-600 flex-grow pt-1"></span>
    </div>
    <slot />
  </div>
</template>
<script>
export default {
  name: "TimelineBlock",
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>
