import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request: NextRequest) { return updateSession(request); }
export const config = { matcher: ["/contacts/:path*", "/cities/:path*", "/dashboard", "/login", "/register", "/forgot-password", "/reset-password"] };
