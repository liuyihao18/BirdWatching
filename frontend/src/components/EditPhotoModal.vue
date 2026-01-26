<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <div class="section-title">编辑照片信息</div>
      <form class="grid grid-gap-12" @submit.prevent="submit">
        <div class="form-row">
          <input class="input" v-model="local.birdNameCn" placeholder="鸟类中文名" />
          <input class="input" v-model="local.birdNameEn" placeholder="鸟类英文名（可选）" />
        </div>
        <div class="form-row">
          <input class="input" v-model="local.birdNamePinyin" placeholder="拼音（可选）" />
          <input class="input" v-model="local.takenAt" type="datetime-local" />
        </div>
        <textarea class="textarea" rows="3" v-model="local.description" placeholder="描述（可选）"></textarea>
        <div class="form-row">
          <input class="input" v-model="local.province" placeholder="省份" />
          <input class="input" v-model="local.city" placeholder="城市" />
        </div>
        <div class="form-row">
          <input class="input" v-model="local.district" placeholder="区/县（可选）" />
          <input class="input" v-model="local.address" placeholder="详细地点（可选）" />
        </div>
        <div class="form-row">
          <input class="input" v-model="local.latitude" placeholder="纬度" />
          <input class="input" v-model="local.longitude" placeholder="经度" />
        </div>
        <div class="flex-row gap-12">
          <button class="button" type="submit">保存</button>
          <button class="button secondary" type="button" @click="$emit('close')">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  photo: { type: Object, required: true }
});

const emit = defineEmits(["save", "close"]);

const local = reactive({
  birdNameCn: "",
  birdNameEn: "",
  birdNamePinyin: "",
  description: "",
  province: "",
  city: "",
  district: "",
  address: "",
  latitude: "",
  longitude: "",
  takenAt: ""
});

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

watch(
  () => props.photo,
  (photo) => {
    if (!photo) return;
    local.birdNameCn = photo.bird_name_cn || "";
    local.birdNameEn = photo.bird_name_en || "";
    local.birdNamePinyin = photo.bird_name_pinyin || "";
    local.description = photo.description || "";
    local.province = photo.province || "";
    local.city = photo.city || "";
    local.district = photo.district || "";
    local.address = photo.address || "";
    local.latitude = photo.latitude ?? "";
    local.longitude = photo.longitude ?? "";
    local.takenAt = toLocalDateTime(photo.taken_at);
  },
  { immediate: true }
);

function submit() {
  emit("save", { ...local });
}
</script>
