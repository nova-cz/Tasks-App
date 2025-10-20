"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export type Section = {
  id: string
  user_id: string
  name: string
  color: string | null
  created_at: string
}

export function useSections(userId?: string) {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from("sections")
      .select("id,user_id,name,color,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
    if (error) setError(error.message)
    setSections(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const createSection = async (name: string, color = "bg-blue-500") => {
    if (!userId) return { error: new Error("No user") }
    const { data, error } = await supabase
      .from("sections")
      .insert({ name, color, user_id: userId })
      .select()
      .single()
    if (!error && data) setSections((prev) => [...prev, data])
    return { data, error }
  }

  const updateSection = async (id: string, patch: Partial<Pick<Section, "name" | "color">>) => {
    const { data, error } = await supabase
      .from("sections")
      .update(patch)
      .eq("id", id)
      .select()
      .single()
    if (!error && data) setSections((prev) => prev.map((s) => (s.id === id ? data : s)))
    return { data, error }
  }

  const deleteSection = async (id: string) => {
    const { error } = await supabase.from("sections").delete().eq("id", id)
    if (!error) setSections((prev) => prev.filter((s) => s.id !== id))
    return { error }
  }

  return { sections, loading, error, fetchSections, createSection, updateSection, deleteSection }
}
