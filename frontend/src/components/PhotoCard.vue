<template>
  <div class="photo-card" @click="$emit('select', photo)">
    <img
      :src="photo.image_thumb_path || photo.image_path"
      :alt="photo.bird_name_cn"
      loading="lazy"
      decoding="async"
    />
    <div class="info">
      <strong>{{ photo.bird_name_cn }}</strong>
      <span class="badge">{{ photo.photographer_name }}</span>
      <small>{{ formatDate(photo.taken_at) }}</small>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  photo: { type: Object, required: true }
});

function formatDate(value) {
  return new Date(value).toLocaleString();
}
</script>
