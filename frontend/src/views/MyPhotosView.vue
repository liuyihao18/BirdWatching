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
            <div class="action-row">
              <button class="button secondary" @click="openEdit(photo)">编辑</button>
              <button class="button secondary" @click="remove(photo)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <PhotoModal v-if="selected" :photo="selected" @close="selected = null" />
    <EditPhotoModal
      v-if="editing"
      :photo="editing"
      @close="editing = null"
      @save="saveEdit"
    />
    <ConfirmModal
      v-if="pendingDelete"
      title="删除照片"
      :message="`确定删除「${pendingDelete.bird_name_cn}」吗？该操作不可撤销。`"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
    <ConfirmModal
      v-if="editSuccess"
      title="修改成功"
      message="照片信息已更新。"
      :show-cancel="false"
      confirm-text="知道了"
      @confirm="handleEditSuccessClose"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";
import PhotoModal from "../components/PhotoModal.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import EditPhotoModal from "../components/EditPhotoModal.vue";

const photos = ref([]);
const selected = ref(null);
const pendingDelete = ref(null);
const editing = ref(null);
const editSuccess = ref(false);

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

function openEdit(photo) {
  editing.value = { ...photo };
}

async function saveEdit(payload) {
  if (!editing.value) {
    return;
  }
  await api.put(`/photos/${editing.value.id}`, payload);
  await loadPhotos();
  editSuccess.value = true;
}

function handleEditSuccessClose() {
  editSuccess.value = false;
  editing.value = null;
}


onMounted(loadPhotos);
</script>
