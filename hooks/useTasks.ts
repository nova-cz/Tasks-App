"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import type { Task } from "@/types/database"

export function useTasks(userId?: string) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    // 📦 obtener tareas desde Supabase
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
            setTasks(data as Task[])
        }
        setLoading(false)
    }

    // 🔁 actualizar tarea
    const updateTask = async (id: string, updates: Partial<Task>) => {
        const { data, error } = await supabase
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (!error && data) {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? (data as Task) : t))
            )
        }
        return { error }
    }

    // ❌ eliminar tarea
    const deleteTask = async (id: string) => {
        console.log('🗑️ [deleteTask] Eliminando tarea:', id)
        const { error } = await supabase.from("tasks").delete().eq("id", id)
        if (!error) {
            console.log('✅ [deleteTask] Tarea eliminada exitosamente, actualizando estado local')
            setTasks((prev) => {
                const updated = prev.filter((t) => t.id !== id)
                console.log('📊 [deleteTask] Tareas antes:', prev.length, 'después:', updated.length)
                return updated
            })
        } else {
            console.error('❌ [deleteTask] Error al eliminar:', error)
        }
        return { error }
    }

    // 🧹 eliminar tareas por sección (bulk)
    const deleteTasksBySection = async (sectionId: string) => {
        if (!userId) return { error: new Error("No user") }
        console.log('🧹 [deleteTasksBySection] Eliminando tareas de la sección:', sectionId)
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("user_id", userId)
            .eq("section_id", sectionId)
        if (!error) {
            setTasks((prev) => {
                const before = prev.length
                const updated = prev.filter((t) => t.section_id !== sectionId)
                console.log('📊 [deleteTasksBySection] Tareas antes:', before, 'después:', updated.length)
                return updated
            })
        } else {
            console.error('❌ [deleteTasksBySection] Error al eliminar:', error)
        }
        return { error }
    }

    // ➕ crear tarea
    const createTask = async (
        input: Omit<Task, "id" | "created_at" | "user_id"> & { section_id?: string | null }
    ) => {
        if (!userId) return { error: new Error("No user") }

        console.log('➕ [createTask] Creando tarea:', input)
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

        // 👇 Inserción y actualización local instantánea
        const { data, error } = await supabase
            .from("tasks")
            .insert(payload)
            .select("*")
            .single()

        if (!error && data) {
            console.log('✅ [createTask] Tarea creada exitosamente:', data)
            setTasks((prev) => {
                const updated = [data as Task, ...prev]
                console.log('📊 [createTask] Tareas antes:', prev.length, 'después:', updated.length)
                return updated
            })
        } else {
            console.error('❌ [createTask] Error al crear:', error)
        }
        return { data: data as Task | null, error }
    }

    // ⚙️ carga inicial + suscripción realtime
    useEffect(() => {
        if (!userId) return
        
        console.log('🔄 [useTasks] Iniciando fetchTasks para userId:', userId)
        fetchTasks()

        console.log('🔌 [useTasks] Configurando canal Realtime para userId:', userId)
        const channel = supabase
            .channel("tasks-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('🔔 [Realtime] Evento recibido:', payload.eventType, payload)
                    const { eventType, new: newTask, old: oldTask } = payload

                    setTasks((prev) => {
                        if (eventType === "INSERT" && newTask) {
                            console.log('➕ [Realtime] INSERT detectado, agregando tarea:', newTask)
                            const exists = prev.some((t) => t.id === newTask.id)
                            return exists ? prev : [newTask as Task, ...prev]
                        }

                        if (eventType === "UPDATE" && newTask) {
                            console.log('🔁 [Realtime] UPDATE detectado, actualizando tarea:', newTask)
                            return prev.map((t) => (t.id === newTask.id ? (newTask as Task) : t))
                        }

                        if (eventType === "DELETE" && oldTask) {
                            console.log('❌ [Realtime] DELETE detectado, eliminando tarea:', oldTask)
                            return prev.filter((t) => t.id !== oldTask.id)
                        }

                        return prev
                    })
                }
            )
            .subscribe((status) => {
                console.log('📡 [Realtime] Estado de suscripción:', status)
            })

        return () => {
            console.log('🔌 [useTasks] Desconectando canal Realtime')
            supabase.removeChannel(channel)
        }
    }, [userId])

    return { tasks, loading, createTask, updateTask, deleteTask, deleteTasksBySection }
}
