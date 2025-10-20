// Browser Supabase client
// Ubicación recomendada: lib/supabase-client.ts
// Uso: import { supabase } from "@/lib/supabase-client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Esto fallará en tiempo de ejecución si faltan variables.
  // Asegúrate de configurar .env.local (ver .env.local.example)
  // Nota: En Next.js, las NEXT_PUBLIC_* se inyectan en el bundle del cliente.
  console.warn(
    "[supabase] Falta configurar NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  )
}

// Evitar múltiples instancias en desarrollo con HMR
let _supabase: SupabaseClient | undefined

export const supabase: SupabaseClient = (() => {
  if (_supabase) return _supabase
  _supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      flowType: "pkce",
    },
  })
  return _supabase
})()

export type { SupabaseClient }
