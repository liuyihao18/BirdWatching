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
          <router-link to="/profile" v-if="auth.isLoggedIn">个人中心</router-link>
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
    <footer class="site-footer">
      <div class="container footer-inner">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
          京ICP备2026006318号
        </a>
        <span class="footer-divider">|</span>
        <a
          href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010802047573"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/police-badge.png" alt="公安备案" class="police-badge" />
          京公网安备11010802047573号
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
</script>
