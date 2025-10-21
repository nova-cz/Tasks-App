"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { useTasksContext } from "@/contexts/TasksContext"
import { useSectionsContext } from "@/contexts/SectionsContext"
import type { Task } from "@/types/database"

// Mapa de conversión de clases Tailwind a colores hex
const tailwindToHex: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-purple-500": "#a855f7",
  "bg-green-500": "#22c55e",
  "bg-orange-500": "#f97316",
  "bg-pink-500": "#ec4899",
  "bg-red-500": "#ef4444",
  "bg-yellow-500": "#eab308",
  "bg-cyan-500": "#06b6d4",
}

export function DailyCalendar() {
  const { tasks, loading: tasksLoading, deleteTask } = useTasksContext()
  const { sections } = useSectionsContext()
  
  console.log('📅 DailyCalendar - Total tareas:', tasks.length, tasks)
  
  // Inicializar con fecha normalizada a medianoche
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    newDate.setHours(0, 0, 0, 0) // Normalizar a medianoche
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    newDate.setHours(0, 0, 0, 0) // Normalizar a medianoche
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalizar a medianoche
    setSelectedDate(today)
  }

  const dateString = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Comparar fechas normalizadas
  const isToday = (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate.getTime() === today.getTime()
  })()

  // Obtener la fecha local en formato YYYY-MM-DD
  const pad = (n: number) => n.toString().padStart(2, "0")
  const selectedDateString = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
  const validSectionIds = new Set(sections.map((s) => s.id))
  // Mostrar solo tareas que pertenecen a una sección existente
  const tasksForDay = tasks.filter((task: Task) => {
    return task.date === selectedDateString && !!task.section_id && validSectionIds.has(task.section_id)
  })
  // Contar huérfanas del día (sin sección o con sección inexistente)
  const orphanTasksToday = tasks.filter((task: Task) => {
    return task.date === selectedDateString && (!task.section_id || !validSectionIds.has(task.section_id))
  })
  
  console.log('📅 Fecha seleccionada:', selectedDateString)
  console.log('📅 Tareas del día:', tasksForDay.length, tasksForDay)

  const getTasksForHour = (hour: number) => {
    return tasksForDay.filter((task: Task) => {
      if (!task.time) return false
      const taskHour = Number.parseInt(task.time.split(":")[0])
      return taskHour === hour
    })
  }

  // Obtener color de sección por ID (hex)
  const getSectionColor = (sectionId: string | null) => {
    if (!sectionId) return "#6b7280" // gris neutro
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return "#6b7280"
    return tailwindToHex[section.color || ""] || section.color || "#6b7280"
  }

  // Obtener nombre de sección por ID
  const getSectionName = (sectionId: string | null) => {
    if (!sectionId) return "Sin sección"
    const section = sections.find((s) => s.id === sectionId)
    return section?.name || "Sin sección"
  }

  const handleCleanOrphans = async () => {
    if (orphanTasksToday.length === 0) return
    const ok = confirm(
      `Se eliminarán ${orphanTasksToday.length} tarea(s) sin sección de este día. ¿Deseas continuar?`
    )
    if (!ok) return
  await Promise.all(orphanTasksToday.map((t: Task) => deleteTask(t.id)))
  }

  return (
    <Card className="overflow-hidden">
      {/* Header del calendario */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Calendario Diario</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8" onClick={goToPreviousDay} aria-label="Día anterior">
              <ChevronLeft className="size-4" />
            </Button>
            {!isToday && (
              <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent" onClick={goToToday}>
                Hoy
              </Button>
            )}
            {orphanTasksToday.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleCleanOrphans}
                title="Eliminar tareas sin sección de este día"
              >
                Limpiar huérfanas ({orphanTasksToday.length})
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-8" onClick={goToNextDay} aria-label="Día siguiente">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{dateString}</p>
      </div>

      {/* Vista de horas */}
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="divide-y">
          {hours.map((hour) => {
            const hourTasks = getTasksForHour(hour)
            const hourString = hour.toString().padStart(2, "0")

            return (
              <div key={hour} className="flex min-h-16 hover:bg-muted/30">
                <div className="flex w-20 shrink-0 items-start justify-center border-r pt-2">
                  <span className="text-sm font-medium text-muted-foreground">{hourString}:00</span>
                </div>

                <div className="flex-1 space-y-1 p-2">
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-md p-2 text-sm text-white`}
                      style={{ backgroundColor: getSectionColor(task.section_id) }}
                    >
                      <div className="font-medium">{task.title}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs opacity-90">
                        <span>{task.time}</span>
                        <span>•</span>
                        <span>{getSectionName(task.section_id)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer con resumen */}
      <div className="border-t bg-muted/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tareas programadas</span>
          <Badge variant="secondary">{tasksForDay.length}</Badge>
        </div>
      </div>
    </Card>
  )
}