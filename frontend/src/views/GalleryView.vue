<template>
  <div class="grid gap-20">
    <section class="card">
      <div class="section-title">画廊</div>
      <div class="form-row">
        <select class="select" v-model="filters.province" @keydown.enter.prevent="loadPhotos">
          <option value="">全部省份</option>
          <option v-for="province in provinces" :key="province" :value="province">
            {{ province }}
          </option>
        </select>
        <input
          class="input"
          v-model="filters.photographerName"
          placeholder="拍摄人姓名"
          @keydown.enter.prevent="loadPhotos"
        />
        <input
          class="input"
          v-model="filters.keyword"
          placeholder="搜索鸟类/地点"
          @keydown.enter.prevent="loadPhotos"
        />
      </div>
      <div class="flex-row gap-12 mt-12">
        <button class="button" @click="loadPhotos">筛选</button>
        <button class="button secondary" @click="reset">重置</button>
      </div>
    </section>

    <section>
      <div class="photo-grid">
        <PhotoCard v-for="photo in photos" :key="photo.id" :photo="photo" @select="selectPhoto" />
      </div>
    </section>

    <PhotoModal v-if="selected" :photo="selected" @close="selected = null" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";
import PhotoCard from "../components/PhotoCard.vue";
import PhotoModal from "../components/PhotoModal.vue";

const photos = ref([]);
const selected = ref(null);
const filters = ref({
  province: "",
  photographerName: "",
  keyword: ""
});
const provinces = ref([]);

async function loadPhotos() {
  const { data } = await api.get("/photos", { params: filters.value });
  photos.value = data.data;
}

async function loadProvinces() {
  const { data } = await api.get("/stats/provinces");
  provinces.value = data.data.map((item) => item.province);
}

function reset() {
  filters.value = { province: "", photographerName: "", keyword: "" };
  loadPhotos();
}

function selectPhoto(photo) {
  selected.value = photo;
}

onMounted(async () => {
  await loadProvinces();
  await loadPhotos();
});
</script>
