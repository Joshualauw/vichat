<script setup>
const props = defineProps(["name", "image", "last_message", "last_seen", "isOnline", "isUnread"]);
const emit = defineEmits(["clicked"]);
</script>

<template>
  <div
    @click="emit('clicked')"
    class="relative hover:bg-lightpurple cursor-pointer w-full h-20 flex items-center space-x-4 border-b border-gray-600"
  >
    <p class="absolute top-4 right-4 text-xs text-gray-300">{{ props.last_seen }}</p>
    <p v-if="props.isUnread" class="absolute top-10 right-4 text-xs bg-fuchsia-700 rounded-full px-3 py-1">new!</p>
    <div class="relative">
      <img :src="props.image" alt="" class="w-12 h-12 rounded-full" />
      <div
        class="absolute top-9 left-9 w-3 h-3 rounded-full border-white border-2"
        :class="{ 'bg-green-500': props.isOnline, 'bg-gray-500': !props.isOnline }"
      ></div>
    </div>
    <div>
      <p class="font-semibold">{{ props.name }}</p>
      <p class="text-sm text-gray-200">{{ props.last_message }}</p>
    </div>
  </div>
</template>
