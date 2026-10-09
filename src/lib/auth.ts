import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
};

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "seravia-dev-secret-change-before-production");
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get("seravia_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER";
    return { sub: payload.sub, email: payload.email, name: payload.name, role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set("seravia_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set("seravia_session", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
