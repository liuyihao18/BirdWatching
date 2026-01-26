import axios from "axios";
import { useAuthStore } from "../stores/auth";
import { config } from "../config";

const api = axios.create({
    baseURL: config.apiBase
});

api.interceptors.request.use((config) => {
    const store = useAuthStore();
    if (store.token) {
        config.headers.Authorization = `Bearer ${store.token}`;
    }
    return config;
});

export default api;
