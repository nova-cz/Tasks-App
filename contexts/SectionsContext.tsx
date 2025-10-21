"use client"

import { createContext, useContext, ReactNode } from "react"
import { useSections } from "@/hooks/useSections"
import { useSupabaseUser } from "@/hooks/useSupabaseUser"
import type { Section } from "@/hooks/useSections"

interface SectionsContextType {
  sections: Section[]
  loading: boolean
  error: string | null
  fetchSections: ReturnType<typeof useSections>["fetchSections"]
  createSection: ReturnType<typeof useSections>["createSection"]
  updateSection: ReturnType<typeof useSections>["updateSection"]
  deleteSection: ReturnType<typeof useSections>["deleteSection"]
}

const SectionsContext = createContext<SectionsContextType | undefined>(undefined)

export function SectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseUser()
  const sectionsData = useSections(user?.id)

  return (
    <SectionsContext.Provider value={sectionsData as SectionsContextType}>
      {children}
    </SectionsContext.Provider>
  )
}

export function useSectionsContext() {
  const context = useContext(SectionsContext)
  if (!context) {
    throw new Error("useSectionsContext debe usarse dentro de SectionsProvider")
  }
  return context
}
