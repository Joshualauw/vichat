<script setup>
const emit = defineEmits(["clicked"]);
const { isSelected } = defineProps(["isSelected"]);
</script>

<template>
  <div
    @click="emit('clicked')"
    class="p-4 cursor-pointer"
    :class="{ 'bg-darkpurple ': isSelected, 'hover:bg-lightpurple': !isSelected }"
  >
    <slot></slot>
  </div>
</template>
