<template>
  <div class="grid gap-16">
    <section class="card">
      <div class="section-title">我的照片</div>
      <p class="hero-text">管理自己上传的照片。</p>
    </section>
    <section>
      <div class="photo-grid">
        <div v-for="photo in photos" :key="photo.id" class="photo-card">
          <img :src="photo.image_thumb_path || photo.image_path" :alt="photo.bird_name_cn" @click="selectPhoto(photo)" />
          <div class="info">
            <strong>{{ photo.bird_name_cn }}</strong>
            <small>{{ formatDate(photo.taken_at) }}</small>
            <button class="button secondary" @click="remove(photo)">删除</button>
          </div>
        </div>
      </div>
    </section>
    <PhotoModal v-if="selected" :photo="selected" @close="selected = null" />
    <ConfirmModal
      v-if="pendingDelete"
      title="删除照片"
      :message="`确定删除「${pendingDelete.bird_name_cn}」吗？该操作不可撤销。`"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";
import PhotoModal from "../components/PhotoModal.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const photos = ref([]);
const selected = ref(null);
const pendingDelete = ref(null);

function formatDate(value) {
  return new Date(value).toLocaleString();
}

async function loadPhotos() {
  const { data } = await api.get("/photos/mine");
  photos.value = data.data;
}

function remove(photo) {
  pendingDelete.value = photo;
}

async function confirmDelete() {
  if (!pendingDelete.value) {
    return;
  }
  await api.delete(`/photos/${pendingDelete.value.id}`);
  pendingDelete.value = null;
  await loadPhotos();
}

function selectPhoto(photo) {
  selected.value = photo;
}


onMounted(loadPhotos);
</script>
