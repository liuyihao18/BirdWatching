<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="grid modal-photo-grid">
        <div class="modal-image-wrap" @click="openLightbox">
          <img
            :src="photo.image_path"
            :alt="photo.bird_name_cn"
            class="modal-image"
          />
        </div>
        <div class="grid modal-info">
          <h2 class="modal-title">{{ photo.bird_name_cn }}</h2>
          <p v-if="photo.bird_name_en">英文名：{{ photo.bird_name_en }}</p>
          <p v-if="photo.bird_name_pinyin">拼音：{{ photo.bird_name_pinyin }}</p>
          <p>拍摄人：{{ photo.photographer_name }}</p>
          <p>拍摄时间：{{ formatDate(photo.taken_at) }}</p>
          <p>地点：{{ photo.province }} {{ photo.city }} {{ photo.district || '' }}</p>
          <p v-if="photo.address">详细地址：{{ photo.address }}</p>
          <p v-if="photo.description">描述：{{ photo.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <VueEasyLightbox
    :visible="lightboxVisible"
    :imgs="[photo.image_path]"
    :index="0"
    @hide="lightboxVisible = false"
  />
</template>

<script setup>
import { ref } from "vue";
import VueEasyLightbox from "vue-easy-lightbox";

const props = defineProps({
  photo: { type: Object, required: true }
});

const lightboxVisible = ref(false);

function openLightbox() {
  lightboxVisible.value = true;
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}
</script>
