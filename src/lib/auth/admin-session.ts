import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Konstanta ini WAJIB sama dengan yang diimpor di middleware.ts
export const ADMIN_SESSION_COOKIE_NAME = "indahseafood_admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 hari

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET belum diset di .env.local");
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  nama: string;
}

export async function createAdminSession(payload: AdminSessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());

  cookies().set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function destroyAdminSession() {
  cookies().delete(ADMIN_SESSION_COOKIE_NAME);
}