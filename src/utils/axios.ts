import axios, {AxiosInstance} from "axios";
import {getUser} from "./auth.ts";
import {User} from "oidc-client-ts";

const instance: AxiosInstance = axios.create({
    withXSRFToken: true,
    withCredentials: true
});

instance.interceptors.request.use(async config => {
    if (!import.meta.env.VITE_MOCKED) {
        const user: User | null = getUser();
        if (user?.access_token) config.headers.Authorization = `Bearer ${user?.access_token}`;
    }
    return config;
});


export default instance;