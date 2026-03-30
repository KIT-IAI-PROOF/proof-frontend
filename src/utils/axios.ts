import axios, {AxiosInstance} from "axios";

const instance: AxiosInstance = axios.create({
    withXSRFToken: true,
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

export default instance;