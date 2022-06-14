<script setup>
const { name, image, last_message, last_seen } = defineProps([
  "name",
  "image",
  "last_message",
  "last_seen",
]);

const emit = defineEmits(["clicked"]);
</script>

<template>
  <div
    @click="emit('clicked')"
    class="relative hover:bg-lightpurple cursor-pointer w-full h-20 flex items-center space-x-4 border-b border-gray-600"
  >
    <p class="absolute top-4 right-4 text-xs text-gray-300">{{ last_seen }}</p>
    <img :src="image" alt="" class="w-12 h-12 rounded-full" />
    <div>
      <p class="font-semibold">{{ name }}</p>
      <p class="text-sm text-gray-200">{{ last_message }}</p>
    </div>
  </div>
</template>
