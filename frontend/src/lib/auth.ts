import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  iat?: number;
  exp?: number;
}

export function getAuthUser(): DecodedToken | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const user = getAuthUser();
  return user ? user.sub : null;
}

export function getUserRole(): "ADMIN" | "SELLER" | "CUSTOMER" | null {
  const user = getAuthUser();
  return user ? user.role : null;
}

export function isUserLoggedIn(): boolean {
  return !!getAuthUser();
}

export function isGuestUser(): boolean {
  return !isUserLoggedIn();
}

export function getHomeRoute(): string {
  const role = getUserRole();
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/";
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

