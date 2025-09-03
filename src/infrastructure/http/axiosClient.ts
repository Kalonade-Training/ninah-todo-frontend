import axios from "axios";
import { API_BASE } from "@/lib/env";
import { getToken } from "../storage/tokenStorage";

console.log("[API_BASE]", API_BASE);

export const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});
