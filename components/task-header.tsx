"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useSupabaseUser } from "@/hooks/useSupabaseUser"

export function TaskHeader() {
  const { theme, setTheme } = useTheme()
  const { user } = useSupabaseUser()

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{"Mis Tareas"}</h1>
        <p className="mt-1 text-muted-foreground">{"Gestiona y organiza tus tareas diarias"}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 neutral-icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Link href="/profile">
          {user?.user_metadata?.avatar_url ? (
            <div className="h-9 w-9 overflow-hidden rounded-full border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.user_metadata.avatar_url as string}
                alt={user.user_metadata.name || user.email || "Avatar"}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Perfil">
              <User className="size-5" />
            </Button>
          )}
        </Link>
      </div>
    </header>
  )
}
