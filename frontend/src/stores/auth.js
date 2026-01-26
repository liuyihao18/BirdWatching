import { defineStore } from "pinia";
import api from "../api/client";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("token") || "",
        user: JSON.parse(localStorage.getItem("user") || "null")
    }),
    getters: {
        isLoggedIn: (state) => Boolean(state.token)
    },
    actions: {
        async login(payload) {
            const { data } = await api.post("/auth/login", payload);
            this.token = data.data.token;
            this.user = data.data.user;
            localStorage.setItem("token", this.token);
            localStorage.setItem("user", JSON.stringify(this.user));
        },
        async fetchMe() {
            const { data } = await api.get("/auth/me");
            this.user = data.data;
            localStorage.setItem("user", JSON.stringify(this.user));
        },
        logout() {
            this.token = "";
            this.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }
});
