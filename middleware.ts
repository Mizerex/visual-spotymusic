import { NextRequest, NextResponse } from "next/server";

const ADMIN_USER = "admin";
const ADMIN_PASSWORD_SHA256 = "f10161955aaa7a325565cdef45d5f930c4f36f6516b4ff325efbd45b2580022e";

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unauthorized() {
  return new NextResponse("Acesso administrativo protegido.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Visual SpotyMusic Admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export async function middleware(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (username !== ADMIN_USER) return unauthorized();

    const passwordHash = await sha256(password);
    if (passwordHash !== ADMIN_PASSWORD_SHA256) return unauthorized();

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/jamendo-test/:path*"],
};
