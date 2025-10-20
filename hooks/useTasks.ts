// hooks/useTasks.ts
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import type { Task } from "@/types/database"  // 👈 importa el tipo correcto

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // 📦 obtener tareas
  const fetchTasks = async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener tareas:", error)
    } else {
      setTasks(data as Task[]) // 👈 asegura el tipo Task
    }
    setLoading(false)
  }

  // 🔁 actualizar tarea
  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
    if (!error) await fetchTasks()
    return { error }
  }

  // ❌ eliminar tarea
  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
    if (!error) setTasks(tasks.filter((t) => t.id !== id))
    return { error }
  }

  // ➕ crear tarea
  const createTask = async (
    input: Omit<Task, "id" | "created_at" | "user_id"> & { section_id?: string | null }
  ) => {
    if (!userId) return { error: new Error("No user") }
    const payload: Partial<Task> & { user_id: string } = {
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? "medium",
      status: input.status ?? "pending",
      date: input.date ?? null,
      time: (input as any).time ?? null,
      tags: input.tags ?? [],
      section_id: input.section_id ?? null,
    }
    const { data, error } = await supabase
      .from("tasks")
      .insert(payload)
      .select("*")
      .single()
    if (!error && data) {
      setTasks((prev) => [data as Task, ...prev])
    }
    return { data: data as Task | null, error }
  }

  // ⚙️ ejecutar al cargar
  useEffect(() => {
    fetchTasks()
  }, [userId])

  return { tasks, loading, updateTask, deleteTask, createTask }
}
