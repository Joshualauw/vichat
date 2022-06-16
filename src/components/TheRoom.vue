<script setup>
const props = defineProps(["name", "image", "last_message", "last_seen"]);
const emit = defineEmits(["clicked"]);
</script>

<template>
  <div
    @click="emit('clicked')"
    class="relative hover:bg-lightpurple cursor-pointer w-full h-20 flex items-center space-x-4 border-b border-gray-600"
  >
    <p class="absolute top-4 right-4 text-xs text-gray-300">{{ props.last_seen }}</p>
    <img :src="props.image" alt="" class="w-12 h-12 rounded-full" />
    <div>
      <p class="font-semibold">{{ props.name }}</p>
      <p class="text-sm text-gray-200">{{ props.last_message }}</p>
    </div>
  </div>
</template>
