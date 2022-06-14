<script setup>
import { inject } from "vue";

const user = inject("user");
const { name, messages } = defineProps(["name", "messages"]);
</script>

<template>
  <div class="relative w-full overflow-hidden hidden md:block md:w-3/4">
    <div class="h-12 py-3 px-5 mb-4 flex items-center border-b border-lightpurple">
      {{ name }}
    </div>
    <div class="overflow-y-auto h-[525px]">
      <div
        v-for="message in messages"
        class="mx-3 mt-3 flex items-center"
        :class="{ 'justify-end': message.user_id.id == user.id }"
      >
        <img
          v-if="message.user_id.id != user.id"
          :src="message.user_id.profile_picture"
          class="w-8 h-8 rounded-full"
        />
        <p class="w-fit bg-fuchsia-900 px-3 py-1.5 text-sm rounded-full ml-2">
          {{ message.content }}
        </p>
      </div>
    </div>
    <form
      @submit.prevent=""
      class="absolute bottom-0 left-0 flex items-center space-x-3 w-full px-5 h-14 bg-lightpurple"
    >
      <input
        type="text"
        class="rounded-full w-full px-3 py-1.5 text-gray-600 text-sm outline-none"
        placeholder="Enter message here.."
      />
      <button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
      </button>
    </form>
  </div>
</template>
