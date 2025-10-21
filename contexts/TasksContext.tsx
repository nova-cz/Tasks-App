"use client"

import { createContext, useContext, ReactNode } from "react"
import { useTasks } from "@/hooks/useTasks"
import { useSupabaseUser } from "@/hooks/useSupabaseUser"
import type { Task } from "@/types/database"

interface TasksContextType {
  tasks: Task[]
  loading: boolean
  createTask: ReturnType<typeof useTasks>["createTask"]
  updateTask: ReturnType<typeof useTasks>["updateTask"]
  deleteTask: ReturnType<typeof useTasks>["deleteTask"]
  deleteTasksBySection: ReturnType<typeof useTasks>["deleteTasksBySection"]
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseUser()
  const tasksData = useTasks(user?.id)

  return (
    <TasksContext.Provider value={tasksData}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasksContext() {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error("useTasksContext debe usarse dentro de TasksProvider")
  }
  return context
}
