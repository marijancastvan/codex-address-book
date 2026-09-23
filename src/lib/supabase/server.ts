import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server components cannot write cookies; middleware refreshes the session. */ }
      },
    },
  });
}
