<script setup>
import { onMounted, provide, ref } from "vue";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import TheHeader from "./components/TheHeader.vue";
import TheRoom from "./components/TheRoom.vue";
import ChatRoom from "./components/ChatRoom.vue";

const user = ref(null);
const rooms = ref([]);
const chatroom = ref(null);
const isLoading = ref(false);
const filteredRooms = ref([]);

const getAllRooms = async () => {
  const roomRef = collection(getFirestore(), "rooms");
  const unsubscribeRoom = onSnapshot(roomRef, async (snapshot) => {
    rooms.value = [];
    snapshot.forEach((r) => rooms.value.push({ id: r.id, ...r.data() }));
    //filter rooms berdasarkan yang dimiliki user saja
    filteredRooms.value = rooms.value.filter((r) => r.participants.includes(user.value.id));
    await filteredRooms.value.map(async (r) => {
      if (r.isGroup) return r;
      const senderId = r.participants.find((r) => r != user.value.id);
      const userRef = doc(getFirestore(), "users", senderId);
      const sender = await getDoc(userRef);
      r.name = sender.data().username;
      r.image = sender.data().profile_picture;
      return r;
    });
  });
  // unsubscribeRoom();
};

onMounted(async () => {
  isLoading.value = true;
  filteredRooms.value = [];
  chatroom.value = null;

  //cek apakah ada user session dari firebase
  const unsubscribeAuth = onAuthStateChanged(getAuth(), async (currentUser) => {
    if (!currentUser) user.value = null;
    else {
      const userRef = doc(getFirestore(), "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      user.value = { id: userDoc.id, ...userDoc.data() };
      await getAllRooms();
    }
  });
  isLoading.value = false;
});

const openChatRoom = async (room) => {
  //fetch semua messages yang memiliki room id yang dipilih
  const q = query(collection(getFirestore(), "messages"), where("room_id", "==", room.id));
  const snapshot = await getDocs(q);
  room.messages = [];
  snapshot.forEach(async (msg) => {
    const userRef = doc(getFirestore(), "users", msg.data().user_id);
    const user = await getDoc(userRef);
    room.messages.push({
      user: { id: user.id, ...user.data() },
      content: msg.data().content,
      send_at: msg.data().send_at,
    });
  });
  chatroom.value = room;
};

provide("user", user);
</script>

<template>
  <div v-if="!isLoading" class="text-gray-50 min-h-screen bg-darkpurple">
    <the-header></the-header>
    <h1 v-if="!user" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">Login to continue</h1>
    <div v-else class="absolute flex top-0 left-0 h-full w-full pt-16 bg-darkpurple">
      <div class="overflow-y-auto w-full md:w-1/4 border-r-0 md:border-r-2 md:border-lightpurple">
        <the-room
          v-for="room in filteredRooms"
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
