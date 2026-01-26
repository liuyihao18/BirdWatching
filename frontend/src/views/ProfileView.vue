<template>
  <div class="grid gap-16">
    <section class="card">
      <div class="section-title">个人中心</div>
      <p class="hero-text">管理个人账号信息与安全设置。</p>
    </section>

    <section class="card">
      <div class="section-title">修改密码</div>
      <form class="grid grid-gap-12" @submit.prevent="submitPassword">
        <div class="form-row">
          <input class="input" v-model="passwordForm.currentPassword" placeholder="原密码" type="password" />
          <input class="input" v-model="passwordForm.newPassword" placeholder="新密码" type="password" />
        </div>
        <div class="form-row">
          <input class="input" v-model="passwordForm.confirmPassword" placeholder="确认新密码" type="password" />
          <div></div>
        </div>
        <div class="flex-row gap-12">
          <button class="button" type="submit">更新密码</button>
          <p v-if="passwordError" class="text-error">{{ passwordError }}</p>
        </div>
      </form>
    </section>

    <ConfirmModal
      v-if="passwordSuccess"
      title="修改成功"
      message="密码已更新，请妥善保管。"
      :show-cancel="false"
      confirm-text="知道了"
      @confirm="passwordSuccess = false"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/client";
import ConfirmModal from "../components/ConfirmModal.vue";

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const passwordError = ref("");
const passwordSuccess = ref(false);

async function submitPassword() {
  passwordError.value = "";
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordError.value = "请填写完整密码信息";
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "两次输入的新密码不一致";
    return;
  }
  try {
    await api.post("/auth/password", {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });
    passwordForm.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
    passwordSuccess.value = true;
  } catch (err) {
    passwordError.value = err?.response?.data?.message || "修改失败";
  }
}
</script>
