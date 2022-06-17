<script setup>
import { doc, getFirestore, updateDoc } from "@firebase/firestore";
import { ref as storageRef, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { computed } from "@vue/reactivity";
import { inject, ref } from "vue";

const user = inject("user");
const isEdit = ref(false);
const fileImage = ref(null);
const fileData = ref(null);
const newUsername = ref(user.value.username);
const editTitle = computed(() => (isEdit.value ? "Edit On" : "Edit Off"));

const submitForm = async () => {
  try {
    const userRef = doc(getFirestore(), "users", user.value.id);
    await updateDoc(userRef, {
      username: newUsername.value,
    });
    if (fileData.value) {
      const path = "profiles/" + user.value.id;
      const profileRef = storageRef(getStorage(), path);
      await uploadBytes(profileRef, fileData.value);
      const backgroundUrl = await getDownloadURL(profileRef);
      await updateDoc(userRef, {
        profile_picture: backgroundUrl,
      });
    }
    alert("Profile successfully updated!");
    isEdit.value = false;
  } catch (err) {
    console.log(err);
  }
};

const handleUpload = () => {
  if (fileImage.value.files) {
    if (/\.(jpe?g|png|gif)$/i.test(fileImage.value.files[0].name)) {
      fileData.value = fileImage.value.files[0];
    }
  }
};
</script>

<template>
  <div class="p-8 mt-6 w-full">
    <div class="flex flex-col items-center justify-center">
      <img :src="user.profile_picture" class="rounded-full w-24 h-24 md:w-36 md:h-36" alt="" />
      <p class="text-xl my-5">{{ user.username }}</p>
      <button @click="isEdit = !isEdit" class="px-3 py-1 rounded-md bg-purple hover:opacity-90">
        {{ editTitle }}
      </button>
      <form @submit.prevent="submitForm" v-if="isEdit" class="flex flex-col space-y-5 mt-4 p-5 rounded-md">
        <div>
          <p class="mb-2">Enter new username:</p>
          <input
            type="text"
            v-model="newUsername"
            placeholder="enter here..."
            class="px-2 py-1 rounded-md w-full outline-none text-gray-700"
          />
        </div>
        <div>
          <input
            ref="fileImage"
            @change="handleUpload"
            type="file"
            class="px-2 py-1 rounded-md file:rounded-full file:bg-fuchsia-700 file:text-white file:cursor-pointer file:hover:opacity-90 file:border-0 file:px-3 file:py-1 file:mr-4"
          />
        </div>
        <button class="px-3 py-1 rounded-lg bg-purple hover:opacity-90">Save Changes</button>
      </form>
    </div>
  </div>
</template>
