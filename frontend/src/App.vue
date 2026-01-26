<template>
  <div>
    <header class="navbar">
      <div class="container navbar-inner">
        <div class="nav-links">
          <strong>观鸟</strong>
          <router-link to="/">地图</router-link>
          <router-link to="/gallery">画廊</router-link>
          <router-link to="/upload" v-if="auth.isLoggedIn">上传</router-link>
          <router-link to="/mine" v-if="auth.isLoggedIn">我的照片</router-link>
          <router-link to="/admin" v-if="auth.user?.role === 'admin'">管理</router-link>
        </div>
        <div class="nav-links">
          <span v-if="auth.isLoggedIn" class="badge">{{ auth.user?.name }}</span>
          <router-link class="button ghost" to="/login" v-if="!auth.isLoggedIn">登录</router-link>
          <button class="button secondary" v-else @click="auth.logout()">退出</button>
        </div>
      </div>
    </header>
    <main class="container page-padding">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
</script>
