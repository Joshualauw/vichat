<script setup>
import { provide, ref } from "vue";
import roomJSON from "./data/rooms.json";
import messageJSON from "./data/messages.json";
import userJSON from "./data/users.json";
import TheHeader from "./components/TheHeader.vue";
import TheRoom from "./components/TheRoom.vue";
import ChatRoom from "./components/ChatRoom.vue";
import { computed } from "@vue/reactivity";

const user = ref(null);
const rooms = ref(roomJSON);
const chatroom = ref(null);

const openChatRoom = (room) => {
  //fetch semua messages yang memiliki room id yang dipilih
  room.messages = messageJSON.filter((m) => m.room_id == room.id);
  //populate field user pada setiap message
  room.messages.map((m) => {
    m.user_id = userJSON.find((u) => u.id == m.user_id);
  });
  chatroom.value = room;
  console.log(room);
};

const computedRooms = computed(() => {
  //filter room yang hanya dimiliki oleh user yang sedang login
  const userRooms = rooms.value.filter((r) => r.participants.includes(user.value.id));
  //jika room itu bukan group, name & imagenya diisi lawan bicara
  return userRooms.map((r) => {
    if (r.isGroup) return r;
    const senderId = r.participants.find((r) => r != user.value.id);
    //fetch user berdasarkan senderId
    const sender = userJSON.find((u) => u.id == senderId);
    r.name = sender.username;
    r.image = sender.profile_picture;
    return r;
  });
});

provide("user", user);
</script>

<template>
  <div class="text-gray-50 min-h-screen bg-darkpurple">
    <the-header></the-header>
    <h1 v-if="!user" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">
      Login to continue
    </h1>
    <div v-else class="absolute flex top-0 left-0 h-full w-full pt-16 bg-darkpurple">
      <div class="overflow-y-auto w-full md:w-1/4 border-r-0 md:border-r-2 md:border-lightpurple">
        <the-room
          v-for="room in computedRooms"
          @clicked="openChatRoom(room)"
          :name="room.name"
          :image="room.image"
          :last_message="room.last_message"
          :last_seen="room.last_seen"
        ></the-room>
      </div>
      <chat-room v-if="chatroom" :messages="chatroom.messages" :name="chatroom.name"></chat-room>
    </div>
  </div>
</template>
