// Cliente único de Supabase Auth para todo el proyecto Swap Me Up.
// Debe cargarse DESPUÉS del CDN de supabase-js y ANTES de cualquier
// script que use smuSupabase / smuGetSession / smuRedirectIfNoSession / smuRedirectIfSession.

const SMU_SUPABASE_URL = "https://neixymqdpagskqtdewts.supabase.co";
const SMU_SUPABASE_KEY = "sb_publishable_C5NaGu086iJSwmi--V96EA_Hamle6Jp";

const smuSupabase = supabase.createClient(SMU_SUPABASE_URL, SMU_SUPABASE_KEY);

// Devuelve la sesión actual (o null) consultando directamente a Supabase.
async function smuGetSession() {
  const { data: { session } } = await smuSupabase.auth.getSession();
  return session;
}

// Si NO hay sesión, redirige a redirectTo. Devuelve la sesión (o null).
async function smuRedirectIfNoSession(redirectTo) {
  const session = await smuGetSession();
  if (!session) {
    window.location.href = redirectTo;
  }
  return session;
}

// Si SÍ hay sesión, redirige a redirectTo. Devuelve la sesión (o null).
async function smuRedirectIfSession(redirectTo) {
  const session = await smuGetSession();
  if (session) {
    window.location.href = redirectTo;
  }
  return session;
}
