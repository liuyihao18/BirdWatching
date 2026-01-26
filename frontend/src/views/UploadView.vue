<template>
  <div>
    <section class="card">
        <div class="section-title">上传照片</div>
        <form @submit.prevent="submit" class="grid grid-gap-16">
        <div class="upload-photo-row">
            <label
            for="photoInput"
            class="upload-photo-picker"
            >
            <img v-if="previewUrl" :src="previewUrl" alt="预览" class="upload-photo-preview" />
            <span v-else class="upload-photo-placeholder">选择图片</span>
            </label>
            <div class="upload-photo-info">
            <strong>{{ file?.name || "未选择图片" }}</strong>
            <small class="text-muted">支持 jpg/png，最大 20MB</small>
            </div>
        </div>
        <input id="photoInput" type="file" accept="image/*" @change="handleFile" class="hidden" />

        <div class="form-row">
            <input id="cnNameInput" class="input" v-model="form.birdNameCn" placeholder="鸟类中文名" />
            <input id="enNameInput" class="input" v-model="form.birdNameEn" placeholder="鸟类英文名（可选）" />
        </div>
        <div class="form-row">
            <input id="pinyinInput" class="input" v-model="form.birdNamePinyin" placeholder="拼音（可选）" />
            <input id="datetimeInput" class="input" v-model="form.takenAt" type="datetime-local" />
        </div>

        <textarea id="descriptionInput" class="textarea" rows="3" v-model="form.description" placeholder="描述（可选）"></textarea>

        <div class="card map-card map-card-sm">
            <div v-if="!hasMapKey" class="map-center">
            <div class="text-center text-muted">
                <strong>请配置百度地图 Key</strong>
                <p class="note">在 .env 中设置 VITE_BAIDU_MAP_KEY</p>
            </div>
            </div>
            <div v-else-if="mapError" class="map-center">
            <div class="text-center text-error">
                <strong>地图加载失败</strong>
                <p class="note">{{ mapError }}</p>
            </div>
            </div>
            <div v-else ref="mapEl" class="map-canvas"></div>
        </div>
        <div class="form-row">
            <input class="input" v-model="searchKeyword" placeholder="粗略搜索地点（如：公园/湖/城市名）" />
            <button class="button secondary" type="button" @click="searchPlace">搜索</button>
        </div>
        <small v-if="searchError" class="text-error">{{ searchError }}</small>
        <small class="text-muted">提示：点击地图选点后，将自动填入经纬度与地址信息。</small>
        <div class="form-row">
            <input id="provinceInput" class="input" v-model="form.province" placeholder="省份" />
            <input id="cityInput" class="input" v-model="form.city" placeholder="城市" />
        </div>
        <div class="form-row">
            <input id="districtInput" class="input" v-model="form.district" placeholder="区/县（可选）" />
            <input id="addressInput" class="input" v-model="form.address" placeholder="详细地点（可选）" />
        </div>
        <div class="form-row">
            <input id="latitudeInput" class="input" v-model="form.latitude" placeholder="纬度" />
            <input id="longitudeInput" class="input" v-model="form.longitude" placeholder="经度" />
        </div>
        <div class="upload-actions">
            <button class="button" type="submit">提交</button>
            <p v-if="error" class="text-error">{{ error }}</p>
        </div>
        </form>
    </section>

    <ConfirmModal
      v-if="successVisible"
      title="上传成功"
      message="照片已上传，可在画廊或我的照片中查看。"
      :show-cancel="false"
      confirm-text="知道了"
      @confirm="successVisible = false"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import api from "../api/client";
import { config } from "../config";
import ConfirmModal from "../components/ConfirmModal.vue";

const form = ref({
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

const file = ref(null);
const previewUrl = ref("");
const error = ref("");
const successVisible = ref(false);
const maxFileSize = 20 * 1024 * 1024;
const mapEl = ref(null);
const mapInstance = ref(null);
const mapMarker = ref(null);
const hasMapKey = Boolean(config.baiduMapKey);
const mapError = ref("");
const searchKeyword = ref("");
const searchError = ref("");

function handleFile(event) {
  const selected = event.target.files[0];
  if (!selected) {
    file.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }
    return;
  }
  if (selected.size > maxFileSize) {
    error.value = "图片大小不能超过20MB";
    file.value = null;
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }
    event.target.value = "";
    return;
  }
  error.value = "";
  file.value = selected;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = URL.createObjectURL(selected);
}

function loadBaiduMapScript() {
  if (window.BMapGL) {
    return Promise.resolve(window.BMapGL);
  }
  if (window.__baiduMapScriptPromise) {
    return window.__baiduMapScriptPromise;
  }
  window.__baiduMapScriptPromise = new Promise((resolve, reject) => {
    const callbackName = "__baiduMapInitUpload";
    window[callbackName] = () => {
      resolve(window.BMapGL);
      delete window[callbackName];
    };
    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${config.baiduMapKey}&callback=${callbackName}`;
    script.onerror = () => reject(new Error("加载百度地图失败"));
    document.head.appendChild(script);
  });
  return window.__baiduMapScriptPromise;
}

async function initMap() {
  if (!hasMapKey || !mapEl.value) {
    return;
  }
  const BMapGL = await loadBaiduMapScript();
  if (!BMapGL || !BMapGL.Map) {
    mapError.value = "百度地图 SDK 未正确加载，请检查 Key 或网络环境";
    return;
  }
  const map = new BMapGL.Map(mapEl.value);
  mapInstance.value = map;
  const centerPoint = new BMapGL.Point(104.195397, 35.86166);
  map.centerAndZoom(centerPoint, 5);
  map.enableScrollWheelZoom(true);

  map.addEventListener("click", async (event) => {
    const { lng, lat } = event.latlng;
    form.value.longitude = lng.toFixed(6);
    form.value.latitude = lat.toFixed(6);
    updateMarker(lng, lat);
    await reverseGeocode(lng, lat);
  });
}

function updateMarker(lng, lat) {
  if (!mapInstance.value) {
    return;
  }
  const point = new window.BMapGL.Point(lng, lat);
  if (mapMarker.value) {
    mapMarker.value.setPosition(point);
  } else {
    mapMarker.value = new window.BMapGL.Marker(point);
    mapInstance.value.addOverlay(mapMarker.value);
  }
}

async function reverseGeocode(lng, lat) {
  if (!window.BMapGL) {
    return;
  }
  const geocoder = new window.BMapGL.Geocoder();
  const point = new window.BMapGL.Point(lng, lat);
  geocoder.getLocation(point, (result) => {
    if (!result) {
      return;
    }
    const { addressComponents, address } = result;
    form.value.province = addressComponents?.province || form.value.province;
    form.value.city = addressComponents?.city || form.value.city;
    form.value.district = addressComponents?.district || form.value.district;
    form.value.address = address || form.value.address;
  });
}

async function searchPlace() {
  searchError.value = "";
  if (!searchKeyword.value.trim()) {
    searchError.value = "请输入地点关键词";
    return;
  }
  if (!mapInstance.value || !window.BMapGL) {
    searchError.value = "地图尚未加载完成";
    return;
  }
  try {
    const localSearch = new window.BMapGL.LocalSearch(mapInstance.value, {
      onSearchComplete: (results) => {
        if (results.getStatus && results.getStatus() !== 0) {
          searchError.value = "未找到匹配地点";
          return;
        }
        const first = results.getPoi && results.getPoi(0);
        if (!first) {
          searchError.value = "未找到匹配地点";
          return;
        }
        const { lng, lat } = first.point;
        mapInstance.value.centerAndZoom(first.point, 14);
        form.value.longitude = lng.toFixed(6);
        form.value.latitude = lat.toFixed(6);
        updateMarker(lng, lat);
        reverseGeocode(lng, lat);
        if (first.address) {
          form.value.address = first.address;
        }
      }
    });
    localSearch.search(searchKeyword.value.trim());
  } catch (error) {
    searchError.value = "搜索失败，请稍后重试";
  }
}

async function submit() {
  error.value = "";
  if (!file.value) {
    error.value = "请先选择图片";
    return;
  }
  try {
    const payload = new FormData();
    Object.entries(form.value).forEach(([key, value]) => payload.append(key, value));
    payload.append("image", file.value);
    await api.post("/photos", payload);
    successVisible.value = true;
  } catch (err) {
    error.value = err?.response?.data?.message || "上传失败";
  }
}

function getBeijingLocalDateTime() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(now);
  const get = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

onMounted(async () => {
  form.value.takenAt = getBeijingLocalDateTime();
  await initMap();
});

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>
