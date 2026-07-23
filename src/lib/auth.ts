"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, sessionCookieValue, SESSION_COOKIE } from "./session";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!checkPassword(password)) {
    return { error: "Nieprawidłowe hasło." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
