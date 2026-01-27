<template>
  <div class="grid gap-20">
    <section class="card">
      <div class="section-title">管理员面板</div>
      <form @submit.prevent="createUser" class="grid grid-gap-12">
        <div class="form-row">
          <input class="input" v-model="userForm.name" placeholder="姓名" />
          <input class="input" v-model="userForm.email" placeholder="邮箱" />
        </div>
        <div class="form-row">
          <input class="input" v-model="userForm.password" placeholder="密码" type="password" />
          <select class="select" v-model="userForm.role">
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="flex-row gap-12 admin-actions">
          <button class="button" type="submit">创建用户</button>
          <span v-if="message" class="text-success">{{ message }}</span>
        </div>
      </form>
    </section>

    <section class="card">
      <div class="section-title">用户列表</div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="user-list-mobile">
        <div v-for="user in users" :key="user.id" class="card user-card">
          <div class="user-card-row">
            <strong>{{ user.name }}</strong>
            <span class="badge">{{ user.role }}</span>
          </div>
          <p class="text-muted user-card-email">{{ user.email }}</p>
          <small class="text-muted">{{ formatDate(user.created_at) }}</small>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-title">全部照片</div>
      <div class="photo-grid">
        <div v-for="photo in photos" :key="photo.id" class="photo-card">
          <img :src="photo.image_thumb_path || photo.image_path" :alt="photo.bird_name_cn" @click="selectPhoto(photo)" />
          <div class="info">
            <strong>{{ photo.bird_name_cn }}</strong>
            <small>{{ photo.photographer_name }}</small>
            <button class="button secondary" @click="remove(photo)">删除</button>
          </div>
        </div>
      </div>
    </section>

    <PhotoModal v-if="selected" :photo="selected" @close="selected = null" />
    <ConfirmModal
      v-if="pendingDelete"
      title="删除照片"
      :message="`确定删除「${pendingDelete.bird_name_cn}」吗？该操作不可撤销。`"
      @cancel="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api/client";
import PhotoModal from "../components/PhotoModal.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const users = ref([]);
const photos = ref([]);
const message = ref("");
const selected = ref(null);
const pendingDelete = ref(null);

const userForm = ref({
  name: "",
  email: "",
  password: "",
  role: "user"
});

function formatDate(value) {
  return new Date(value).toLocaleString();
}

async function loadUsers() {
  const { data } = await api.get("/admin/users");
  users.value = data.data;
}

async function loadPhotos() {
  const { data } = await api.get("/photos");
  photos.value = data.data;
}

async function createUser() {
  message.value = "";
  await api.post("/admin/users", userForm.value);
  message.value = "创建成功";
  userForm.value = { name: "", email: "", password: "", role: "user" };
  await loadUsers();
}

function remove(photo) {
  pendingDelete.value = photo;
}

async function confirmDelete() {
  if (!pendingDelete.value) {
    return;
  }
  await api.delete(`/photos/${pendingDelete.value.id}`);
  pendingDelete.value = null;
  await loadPhotos();
}

function selectPhoto(photo) {
  selected.value = photo;
}

onMounted(async () => {
  await loadUsers();
  await loadPhotos();
});
</script>
