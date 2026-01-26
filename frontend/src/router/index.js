import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GalleryView from "../views/GalleryView.vue";
import LoginView from "../views/LoginView.vue";
import UploadView from "../views/UploadView.vue";
import MyPhotosView from "../views/MyPhotosView.vue";
import AdminView from "../views/AdminView.vue";
import ProfileView from "../views/ProfileView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", name: "home", component: HomeView },
        { path: "/gallery", name: "gallery", component: GalleryView },
        { path: "/login", name: "login", component: LoginView },
        { path: "/upload", name: "upload", component: UploadView, meta: { requiresAuth: true } },
        { path: "/mine", name: "mine", component: MyPhotosView, meta: { requiresAuth: true } },
        { path: "/profile", name: "profile", component: ProfileView, meta: { requiresAuth: true } },
        { path: "/admin", name: "admin", component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } }
    ]
});

router.beforeEach((to, from, next) => {
    const store = useAuthStore();
    if (to.meta.requiresAuth && !store.isLoggedIn) {
        return next({ name: "login", query: { redirect: to.fullPath } });
    }
    if (to.meta.requiresAdmin && store.user?.role !== "admin") {
        return next({ name: "home" });
    }
    return next();
});

export default router;
