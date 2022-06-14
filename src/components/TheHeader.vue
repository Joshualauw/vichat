<script setup>
import { inject } from "vue";
import userJSON from "../data/users.json";

const user = inject("user");

const login = () => {
  user.value = userJSON[0];
};

const logout = () => {
  user.value = null;
};
</script>

<template>
  <div
    class="p-4 h-16 fixed z-10 w-full flex justify-between items-center shadow-sm shadow-graypurple bg-purple"
  >
    <h1 class="text-xl tracking-wider font-semibold">Vichat</h1>
    <div class="flex items-center">
      <img
        v-if="user"
        :src="user.profile_picture"
        :alt="user.username"
        class="w-7 h-7 rounded-full mr-2"
      />
      <p v-if="user" class="mr-4">{{ user.username }}</p>
      <button
        v-if="user"
        @click="logout"
        class="rounded-lg bg-darkpurple hover:opacity-80 shadow-sm shadow-darkpurple px-2 py-1"
      >
        Logout
      </button>
      <button
        v-else
        @click="login"
        class="rounded-lg bg-darkpurple hover:opacity-80 shadow-sm shadow-darkpurple px-2 py-1"
      >
        login
      </button>
    </div>
  </div>
</template>
