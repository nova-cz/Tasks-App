"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, User, LogOut, Github } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGitHub = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    })
    if (error) {
      console.error("Error al iniciar sesión con GitHub", error)
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Error al cerrar sesión", error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 size-4" />
              Volver a tareas
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="mt-1 text-muted-foreground">Autentícate para sincronizar tus tareas</p>
        </div>

        {/* Auth Card */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-center">
            {user?.user_metadata?.avatar_url ? (
              <div className="h-20 w-20 overflow-hidden rounded-full border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.user_metadata.avatar_url as string}
                  alt={user.user_metadata.name || user.email || "Avatar"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="rounded-full bg-primary/10 p-4">
                <User className="size-12 text-primary" />
              </div>
            )}
          </div>

          {user ? (
            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Sesión iniciada como</p>
                <p className="font-medium">{user.user_metadata?.name || user.email || user.id}</p>
                {user.user_metadata?.user_name && (
                  <p className="text-xs text-muted-foreground">@{user.user_metadata.user_name}</p>
                )}
                {user.user_metadata?.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{user.user_metadata.bio}</p>
                )}
              </div>
              <Button variant="outline" onClick={signOut} disabled={loading} className="inline-flex items-center gap-2">
                <LogOut className="size-4" /> Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <Button onClick={signInWithGitHub} disabled={loading} className="inline-flex items-center gap-2">
                <Github className="size-4" /> Iniciar sesión con GitHub
              </Button>
              <p className="text-xs text-muted-foreground">Se abrirá la ventana de autorización de GitHub.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
