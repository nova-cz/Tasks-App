// types/database.ts
// Tipos compartidos para toda la aplicación

export interface Section {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  section_id: string | null
  title: string
  description: string | null
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  date: string | null
  time: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type TaskStatus = "pending" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"