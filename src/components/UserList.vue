<script setup>
const props = defineProps(["name", "image"]);
const emit = defineEmits(["clicked"]);
</script>

<template>
  <div @click="emit('clicked')" class="relative pl-4 w-full h-20 flex items-center space-x-4 border-b border-gray-600">
    <img :src="props.image" alt="" class="w-12 h-12 rounded-full" />
    <div>
      <p class="font-semibold mb-2">{{ props.name }}</p>
      <button class="text-sm text-gray-200 rounded-full bg-fuchsia-800 hover:bg-lightpurple px-3 py-0.5">
        Add to Chat List +
      </button>
    </div>
  </div>
</template>
