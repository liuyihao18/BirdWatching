<template>
  <div class="grid home-grid">
    <section class="hero card hero-home">
      <div class="hero-copy">
        <h1 class="hero-title">观鸟中国地图</h1>
        <p class="hero-text">
          在地图上查看各省观鸟热度与分布，触摸省份查看统计，
          并探索照片分布与热门鸟类。
        </p>
        <div class="hero-actions">
          <router-link to="/gallery" class="button">查看画廊</router-link>
          <router-link to="/upload" class="button secondary">上传照片</router-link>
        </div>
      </div>
      <div class="card hero-map-card">
        <div v-if="!hasMapKey" class="hero-map-center">
          <div class="hero-map-muted">
            <strong>请配置百度地图 Key</strong>
            <p class="note">在 .env 中设置 VITE_BAIDU_MAP_KEY</p>
          </div>
        </div>
        <div v-else-if="mapError" class="hero-map-center">
          <div class="hero-map-error">
            <strong>地图加载失败</strong>
            <p class="note">{{ mapError }}</p>
          </div>
        </div>
        <div v-else ref="mapEl" class="hero-map"></div>
      </div>
    </section>

    <section class="card">
      <div class="section-title">省份统计</div>
      <div class="grid grid-3">
        <div v-for="item in stats" :key="item.province" class="card province-card">
          <div class="province-card-header">
            <strong>{{ item.province }}</strong>
            <span class="badge">{{ item.photoCount }} 张</span>
          </div>
          <p>鸟类数量：{{ item.birdCount }}</p>
          <p>Top3：
            <span v-for="(bird, idx) in item.topBirds" :key="bird.bird_name">
              {{ bird.bird_name }}<span v-if="idx < item.topBirds.length - 1"> / </span>
            </span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";
import { config } from "../config";

const stats = ref([]);
const mapEl = ref(null);
const mapInstance = ref(null);
const markers = ref([]);
const provincePolygons = ref([]);
const hasMapKey = Boolean(config.baiduMapKey);
const mapError = ref("");
let mapScriptPromise = null;
const boundaryCache = new Map();

async function loadStats() {
  const { data } = await api.get("/stats/provinces");
  stats.value = data.data;
}

function loadBaiduMapScript() {
  if (window.BMapGL) {
    return Promise.resolve(window.BMapGL);
  }
  if (mapScriptPromise) {
    return mapScriptPromise;
  }
  mapScriptPromise = new Promise((resolve, reject) => {
    const callbackName = "__baiduMapInit";
    window[callbackName] = () => {
      resolve(window.BMapGL);
      delete window[callbackName];
    };
    const script = document.createElement("script");
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${config.baiduMapKey}&callback=${callbackName}`;
    script.onerror = () => reject(new Error("加载百度地图失败"));
    document.head.appendChild(script);
  });
  return mapScriptPromise;
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
  map.centerAndZoom(new BMapGL.Point(104.195397, 35.86166), 5);
  map.enableScrollWheelZoom(true);
  await loadPoints();
  await renderProvincePolygons();
}

function getColorByCount(count) {
  if (count >= 200) return "#1d4ed8";
  if (count >= 100) return "#2563eb";
  if (count >= 50) return "#3b82f6";
  if (count >= 10) return "#93c5fd";
  if (count > 0) return "#dbeafe";
  return "#f1f5f9";
}

function clearProvincePolygons() {
  if (!mapInstance.value) {
    return;
  }
  provincePolygons.value.forEach((polygon) => mapInstance.value.removeOverlay(polygon));
  provincePolygons.value = [];
}

function getProvinceStatsMap() {
  const map = new Map();
  stats.value.forEach((item) => {
    map.set(item.province, item);
  });
  return map;
}

async function fetchBoundary(provinceName) {
  if (boundaryCache.has(provinceName)) {
    return boundaryCache.get(provinceName);
  }
  const promise = new Promise((resolve, reject) => {
    const boundary = new window.BMapGL.Boundary();
    boundary.get(provinceName, (result) => {
      if (!result || !result.boundaries || result.boundaries.length === 0) {
        boundaryCache.delete(provinceName);
        reject(new Error("未获取到边界"));
        return;
      }
      resolve(result.boundaries);
    });
  });
  boundaryCache.set(provinceName, promise);
  return promise;
}

async function renderProvincePolygons() {
  if (!mapInstance.value || !window.BMapGL) {
    return;
  }
  if (!stats.value.length) {
    return;
  }
  clearProvincePolygons();
  const statsMap = getProvinceStatsMap();

  for (const item of stats.value) {
    const provinceName = item.province;
    try {
      const boundaries = await fetchBoundary(provinceName);
      boundaries.forEach((boundary) => {
        const points = boundary.split(";").map((point) => {
          const [lng, lat] = point.split(",").map(Number);
          return new window.BMapGL.Point(lng, lat);
        });
        const polygon = new window.BMapGL.Polygon(points, {
          strokeColor: "#1e3a8a",
          strokeWeight: 1,
          fillColor: getColorByCount(item.photoCount),
          fillOpacity: 0.6
        });
        polygon.addEventListener("mouseover", (event) => {
          polygon.setFillOpacity(0.8);
          const current = statsMap.get(provinceName);
          const info = new window.BMapGL.InfoWindow(
            `<div><strong>${provinceName}</strong><br/>照片数量：${current.photoCount}<br/>鸟类数量：${current.birdCount}</div>`
          );
          let anchorPoint = points[0];
          if (event?.pixel && mapInstance.value?.pixelToPoint) {
            anchorPoint = mapInstance.value.pixelToPoint(event.pixel);
          } else if (event?.latlng) {
            anchorPoint = event.latlng;
          }
          mapInstance.value.openInfoWindow(info, anchorPoint);
        });
        polygon.addEventListener("mouseout", () => {
          polygon.setFillOpacity(0.6);
          mapInstance.value.closeInfoWindow();
        });
        mapInstance.value.addOverlay(polygon);
        provincePolygons.value.push(polygon);
      });
    } catch (error) {
      // 忽略无法获取边界的省份
    }
  }
}

async function loadPoints() {
  const { data } = await api.get("/stats/points");
  const points = data.data || [];
  if (!mapInstance.value) {
    return;
  }
  markers.value.forEach((marker) => mapInstance.value.removeOverlay(marker));
  markers.value = [];
  points.forEach((item) => {
    const point = new window.BMapGL.Point(Number(item.longitude), Number(item.latitude));
    const marker = new window.BMapGL.Marker(point);
    const label = new window.BMapGL.Label(`${item.bird_name_cn}`, {
      offset: new window.BMapGL.Size(10, -6)
    });
    // marker.setLabel(label);
    marker.addEventListener("click", () => {
      const info = new window.BMapGL.InfoWindow(
        `<div><strong>${item.bird_name_cn}</strong><br/>${new Date(item.taken_at).toLocaleString()}</div>`
      );
      mapInstance.value.openInfoWindow(info, point);
    });
    mapInstance.value.addOverlay(marker);
    markers.value.push(marker);
  });
}

onMounted(async () => {
  await loadStats();
  await initMap();
});
</script>
