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
        <div v-if="mapError" class="hero-map-center">
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
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import "echarts/map/js/china";
import api from "../api/client";

const stats = ref([]);
const mapEl = ref(null);
const chartInstance = ref(null);
const mapError = ref("");

async function loadStats() {
  const { data } = await api.get("/stats/provinces");
  stats.value = data.data;
}

function buildSeriesData() {
  return stats.value.map((item) => ({
    name: item.province,
    value: item.photoCount,
    birdCount: item.birdCount,
    topBirds: item.topBirds
  }));
}

function renderChart() {
  if (!chartInstance.value) {
    return;
  }
  const seriesData = buildSeriesData();
  chartInstance.value.setOption({
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const data = params.data || {};
        const birdCount = data.birdCount ?? 0;
        const photoCount = data.value ?? 0;
        const topBirds = Array.isArray(data.topBirds)
          ? data.topBirds.map((b) => b.bird_name).join(" / ")
          : "";
        return `${params.name}<br/>照片数量：${photoCount}<br/>鸟类数量：${birdCount}${topBirds ? `<br/>Top3：${topBirds}` : ""}`;
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(1, ...seriesData.map((item) => item.value || 0)),
      left: "left",
      bottom: 10,
      text: ["高", "低"],
      inRange: {
        color: ["#f1f5f9", "#93c5fd", "#3b82f6", "#1d4ed8"]
      }
    },
    series: [
      {
        name: "省份",
        type: "map",
        map: "china",
        roam: false,
        center: [104.0, 35.6],
        zoom: 1.66,
        label: {
          show: false
        },
        emphasis: {
          label: { show: true }
        },
        data: seriesData
      }
    ]
  });
}

async function initMap() {
  if (!mapEl.value) {
    return;
  }
  try {
    chartInstance.value = echarts.init(mapEl.value);
    renderChart();
    window.addEventListener("resize", resizeChart);
  } catch (error) {
    mapError.value = "地图加载失败，请稍后重试";
  }
}

function resizeChart() {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
}

watch(stats, () => {
  renderChart();
});

onMounted(async () => {
  await loadStats();
  await initMap();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
});
</script>
