<template>
  <div>
    <section class="card card-centered">
        <div class="section-title">登录</div>
        <form @submit.prevent="submit">
        <div class="grid grid-gap-12">
          <input class="input" v-model="form.identifier" placeholder="用户名或邮箱" />
            <input class="input" v-model="form.password" placeholder="密码" type="password" />
            <button class="button" type="submit">登录</button>
            <p v-if="error" class="text-error">{{ error }}</p>
        </div>
        </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = ref({
  identifier: "",
  password: ""
});
const error = ref("");

async function submit() {
  error.value = "";
  try {
    await auth.login(form.value);
    router.push(route.query.redirect || "/");
  } catch (err) {
    error.value = err?.response?.data?.message || "登录失败";
  }
}
</script>
