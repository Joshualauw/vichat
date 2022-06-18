<script setup>
import { addDoc, collection, deleteDoc, doc, getFirestore, updateDoc } from "@firebase/firestore";
import { inject, ref } from "vue";
import moment from "moment";

const user = inject("user");
const newMessage = ref("");
const emits = defineEmits(["close"]);
const props = defineProps(["room_id", "room_name", "room_image", "messages"]);

const updateLastMessage = async () => {
  const roomDoc = doc(getFirestore(), "rooms", props.room_id);
  const lastData = props.messages[props.messages.length - 1];
  const time = new Date(0);
  time.setUTCSeconds(lastData.send_at.seconds);
  const last_seen = moment(time).format("H:mm A");
  await updateDoc(roomDoc, {
    last_message: lastData != null ? lastData.content : "",
    last_seen: lastData != null ? last_seen : "",
  });
};

const sendMessage = async () => {
  if (newMessage.value == "") return;
  const messageRef = collection(getFirestore(), "messages");
  const timestamp = new Date();
  await addDoc(messageRef, {
    room_id: props.room_id,
    user_id: user.value.id,
    send_at: timestamp,
    content: newMessage.value,
  });
  await updateLastMessage();
  newMessage.value = "";
};

const unsendMessage = async (message) => {
  if (message.user_id == user.value.id) {
    const messageRef = doc(getFirestore(), "messages", message.id);
    await deleteDoc(messageRef);
    await updateLastMessage();
  }
};
</script>

<template>
  <div class="fixed top-0 left-0 h-screen w-screen z-50 bg-darkpurple md:relative md:w-3/4 md:h-full overflow-hidden">
    <div class="h-12 py-3 px-5 mb-4 flex items-center justify-between border-b border-lightpurple">
      {{ props.room_name }}
      <p class="text-lg block md:hidden text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          @click="$emit('close')"
          class="h-5 w-5 cursor-pointer"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </p>
    </div>
    <div class="overflow-y-auto h-[525px] pb-5">
      <div
        v-for="message in props.messages"
        class="mx-3 mt-3 flex items-center"
        :class="{ 'justify-end': message.user_id == user.id }"
      >
        <img v-if="message.user_id != user.id" :src="room_image" class="w-8 h-8 rounded-full" />
        <p
          @click="unsendMessage(message)"
          class="w-fit bg-fuchsia-900 px-3 py-1.5 text-sm rounded-full ml-2"
          :class="{ 'cursor-pointer hover:opacity-80': message.user_id == user.id }"
        >
          {{ message.content }}
        </p>
      </div>
    </div>
    <form
      @submit.prevent="sendMessage"
      class="absolute bottom-0 left-0 flex items-center space-x-3 w-full px-5 h-16 bg-lightpurple"
    >
      <input
        type="text"
        v-model="newMessage"
        class="rounded-full w-full px-3 py-2 text-gray-600 text-sm outline-none"
        placeholder="Enter message here.."
      />
      <button>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
      </button>
    </form>
  </div>
</template>
