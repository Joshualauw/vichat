<script setup>
import { onMounted, provide, ref } from "vue";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import barItem from "./data/barItem.json";
import TheHeader from "./components/TheHeader.vue";
import TheRoom from "./components/TheRoom.vue";
import ChatRoom from "./components/ChatRoom.vue";
import BarItem from "./components/BarItem.vue";
import MessageIcon from "./assets/MessageIcon.svg";
import UserAddIcon from "./assets/UserAddIcon.svg";

const user = ref(null);
provide("user", user);

const rooms = ref([]);
const chatroom = ref(null);
const isLoading = ref(false);
const filteredRooms = ref([]);
const messages = ref([]);
const icons = [
  { name: "message", icon: MessageIcon },
  { name: "user-add", icon: UserAddIcon },
];
const selectedIcon = ref(icons[0].name);

const getAllRooms = async () => {
  const roomRef = collection(getFirestore(), "rooms");
  const snapshot = await getDocs(roomRef);
  filteredRooms.value = [];
  chatroom.value = null;
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
};

onMounted(async () => {
  isLoading.value = true;
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
  const roomRef = doc(getFirestore(), "rooms", room.id);
  const unsubscribeRoom = onSnapshot(roomRef, (doc) => {
    const room = rooms.value.find((r) => r.id == doc.id);
    room.last_seen = doc.data().last_seen;
    room.last_message = doc.data().last_message;
  });
  chatroom.value = room;
  //fetch semua messages yang memiliki room id yang dipilih
  const messageRef = collection(getFirestore(), "messages");
  const q = query(messageRef, where("room_id", "==", room.id), orderBy("send_at"));
  const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
    let temp = [];
    messages.value = [];
    snapshot.forEach((doc) => temp.push(doc));
    for (let i = 0; i < temp.length; i++) {
      messages.value.push({ id: temp[i].id, ...temp[i].data() });
    }
  });
};

const switchTab = (icon) => {
  selectedIcon.value = icon;
  chatroom.value = null;
};
</script>

<template>
  <div v-if="!isLoading" class="text-gray-50 min-h-screen bg-darkpurple">
    <the-header></the-header>
    <h1 v-if="!user" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">Login to continue</h1>
    <div v-else class="absolute flex top-0 left-0 h-full w-full pt-16 bg-darkpurple">
      <div class="w-14 h-full bg-purple">
        <bar-item v-for="icon in icons" @clicked="switchTab(icon.name)" :is-selected="selectedIcon == icon.name">
          <component :is="icon.icon" />
        </bar-item>
      </div>
      <div class="overflow-y-auto w-full md:w-1/4 border-r-0 md:border-r-2 md:border-lightpurple">
        <the-room
          v-if="selectedIcon == icons[0].name"
          v-for="room in filteredRooms"
          @clicked="openChatRoom(room)"
          :name="room.name"
          :image="room.image"
          :last_message="room.last_message"
          :last_seen="room.last_seen"
        ></the-room>
      </div>
      <chat-room
        v-if="chatroom"
        :messages="messages"
        :room_image="chatroom.image"
        :room_id="chatroom.id"
        :room_name="chatroom.name"
      ></chat-room>
    </div>
  </div>
</template>
