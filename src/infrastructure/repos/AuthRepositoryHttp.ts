import { http } from "../http/axiosClient";
import type { AuthRepository } from "@/domain/ports/AuthRepository";

export class AuthRepositoryHttp implements AuthRepository {
  async login(email: string, password: string) {
    console.log("[AuthRepo] POST /login");
    const { data } = await http.post("/login", { email, password });
    return { token: data.token as string };
  }
  async register(username: string, email: string, password: string) {
    console.log("[AuthRepo] POST /register");
    await http.post("/register", { username, email, password });
  }
}
