<script setup>
import { onMounted, provide, ref } from "vue";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import barItem from "./data/barItem.json";
import TheHeader from "./components/TheHeader.vue";
import TheRoom from "./components/TheRoom.vue";
import ChatRoom from "./components/ChatRoom.vue";
import BarItem from "./components/BarItem.vue";
import UserList from "./components/UserList.vue";
import UserProfile from "./components/UserProfile.vue";
import MessageIcon from "./assets/MessageIcon.svg";
import UserAddIcon from "./assets/UserAddIcon.svg";
import UserProfileIcon from "./assets/UserProfileIcon.svg";

const user = ref(null);
provide("user", user);

const rooms = ref([]);
const isOpen = ref(true);
const chatroom = ref(null);
const userList = ref([]);
const messages = ref([]);
let unsubscribeMessages = null;
let unsubscribeAuth = null;
let unsubscribeRoom = null;
let unsubscribeUser = null;
let unsubscribeUsers = null;
const icons = [
  { name: "message", icon: MessageIcon },
  { name: "user-add", icon: UserAddIcon },
  { name: "user-profile", icon: UserProfileIcon },
];
const selectedIcon = ref(icons[0].name);

const getUserList = async () => {
  userList.value = [];
  const userRef = collection(getFirestore(), "users");
  const q = query(userRef, where(documentId(), "!=", user.value.id));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    //add to list if room with that user and current user doesn't exist
    const roomExist = rooms.value.find(
      (r) => r.participants.includes(doc.id) && r.participants.includes(user.value.id)
    );
    if (!roomExist) {
      userList.value.push({ id: doc.id, ...doc.data() });
    }
  });
};

const getAllRooms = async () => {
  const roomRef = query(collection(getFirestore(), "rooms"));
  if (unsubscribeRoom) unsubscribeRoom();
  unsubscribeRoom = onSnapshot(roomRef, async (snapshot) => {
    rooms.value = [];
    snapshot.forEach((r) => rooms.value.push({ id: r.id, ...r.data() }));
    //filter rooms by user
    rooms.value = rooms.value.filter((r) => r.participants.includes(user.value.id));
    for (let i = 0; i < rooms.value.length; i++) {
      const r = rooms.value[i];
      if (r.isGroup) return r;
      const senderId = r.participants.find((r) => r != user.value.id);
      const userRef = doc(getFirestore(), "users", senderId);
      const sender = await getDoc(userRef);
      r.isOnline = sender.data().isOnline;
      r.name = sender.data().username;
      r.image = sender.data().profile_picture;
      r.isUnread = user.value.unreads.includes(r.id);
    }
    await getUserList();
  });
};

onMounted(async () => {
  if (unsubscribeAuth) unsubscribeAuth();
  unsubscribeAuth = onAuthStateChanged(getAuth(), async (currentUser) => {
    if (!currentUser) {
      if (user.value) {
        //detect if user recently logout and change status to offline
        const userRef = doc(getFirestore(), "users", user.value.id);
        await updateDoc(userRef, { isOnline: false });
      }
      user.value = null;
    } else {
      const userRef = doc(getFirestore(), "users", currentUser.uid);
      if (unsubscribeUser) unsubscribeUser();
      unsubscribeUser = onSnapshot(userRef, (doc) => {
        user.value = { id: doc.id, ...doc.data() };
      });
      await updateDoc(userRef, { isOnline: true });
    }
    //subscribe to users collection when profile or online status changes
    const userRef = collection(getFirestore(), "users");
    if (unsubscribeUsers) unsubscribeUsers();
    unsubscribeUsers = onSnapshot(userRef, async () => {
      await getAllRooms();
    });
  });
});

const openChatRoom = async (room) => {
  isOpen.value = true;
  const userRef = doc(getFirestore(), "users", user.value.id);
  await updateDoc(userRef, {
    unreads: arrayRemove(room.id),
  });
  chatroom.value = room;
  if (unsubscribeMessages) unsubscribeMessages();
  //subscribe messages with this room id
  const messageRef = collection(getFirestore(), "messages");
  const q = query(messageRef, where("room_id", "==", room.id), orderBy("send_at", "desc"), limit(20));
  unsubscribeMessages = onSnapshot(q, async (snapshot) => {
    let temp = [];
    messages.value = [];
    snapshot.forEach((doc) => temp.unshift(doc));
    for (let i = 0; i < temp.length; i++) {
      messages.value.push({ id: temp[i].id, ...temp[i].data() });
    }
  });
};

const addRoom = async (newUser) => {
  const roomRef = collection(getFirestore(), "rooms");
  await addDoc(roomRef, {
    name: "",
    image: "",
    last_message: "",
    last_seen: "",
    isGroup: false,
    participants: [user.value.id, newUser.id],
  });
};

const switchTab = (icon) => {
  selectedIcon.value = icon;
  chatroom.value = null;
};
</script>

<template>
  <div class="text-gray-50 min-h-screen bg-darkpurple">
    <the-header @profile-clicked="selectedIcon = icons[2].name"></the-header>
    <h1 v-if="!user" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">Login to continue</h1>
    <div v-else class="absolute flex top-0 left-0 h-full w-full pt-16 bg-darkpurple">
      <div class="w-16 md:w-14 h-full bg-purple">
        <bar-item v-for="icon in icons" @clicked="switchTab(icon.name)" :is-selected="selectedIcon == icon.name">
          <component :is="icon.icon" />
        </bar-item>
      </div>
      <user-profile v-if="selectedIcon == icons[2].name"></user-profile>
      <div v-else class="overflow-y-auto w-full md:w-1/4 border-r-0 md:border-r-2 md:border-lightpurple">
        <keep-alive>
          <the-room
            v-if="selectedIcon == icons[0].name"
            v-for="room in rooms"
            @clicked="openChatRoom(room)"
            :name="room.name"
            :image="room.image"
            :last_message="room.last_message"
            :last_seen="room.last_seen"
            :is-online="room.isOnline"
            :is-unread="room.isUnread"
          ></the-room>
          <user-list
            v-else-if="selectedIcon == icons[1].name"
            v-for="user in userList"
            @clicked="addRoom(user)"
            :name="user.username"
            :image="user.profile_picture"
          ></user-list>
        </keep-alive>
      </div>
      <chat-room
        v-if="chatroom && isOpen"
        @close="isOpen = false"
        :messages="messages"
        :room_image="chatroom.image"
        :room_id="chatroom.id"
        :room_name="chatroom.name"
        :room-participants="chatroom.participants"
      ></chat-room>
    </div>
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 100%;
}

::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: #5b4b8a;
}

::-webkit-scrollbar-thumb {
  background: #4c3575;
  border-radius: 100vh;
  border: 3px solid #4c3575;
}

::-webkit-scrollbar-thumb:hover {
  background: #7858a6;
}
</style>
