"use client"

import { useState } from "react"
import { useSupabaseUser } from "@/hooks/useSupabaseUser"
import { useSections } from "@/hooks/useSections"
import { useTasks } from "@/hooks/useTasks"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, ChevronDown, ChevronRight, MoreVertical } from "lucide-react"
import { TaskItem } from "@/components/task-item"
import { AddSectionModal } from "@/components/add-section-modal"
import { AddTaskModal } from "@/components/add-task-modal"
import { EditTaskModal } from "@/components/edit-task-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TaskStatus, Task } from "@/types/database"

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

export function TaskSections() {
  const { user } = useSupabaseUser()

  const {
    sections,
    loading: sectionsLoading,
    createSection,
    deleteSection,
  } = useSections(user?.id)

  const {
    tasks,
    loading: tasksLoading,
    updateTask,
    deleteTask,
    createTask,
  } = useTasks(user?.id)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [activeFilters, setActiveFilters] = useState<Record<string, "all" | TaskStatus>>({})
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false)
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const setFilter = (sectionId: string, filter: "all" | TaskStatus) => {
    setActiveFilters((prev) => ({
      ...prev,
      [sectionId]: filter,
    }))
  }

  const handleAddTask = (sectionId: string) => {
    setSelectedSection(sectionId)
    setIsAddTaskModalOpen(true)
  }

  const handleToggleTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const { error } = await updateTask(taskId, { status: newStatus })
    if (error) {
      alert("Error al actualizar la tarea: " + error.message)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return
    
    const { error } = await deleteTask(taskId)
    if (error) {
      alert("Error al eliminar la tarea: " + error.message)
    }
  }

  const handleOpenEditTask = (task: Task) => {
    setTaskBeingEdited(task)
    setIsEditTaskModalOpen(true)
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sección? Se eliminarán todas sus tareas.")) return
    
    const { error } = await deleteSection(sectionId)
    if (error) {
      alert("Error al eliminar la sección: " + error.message)
    }
  }

  const getFilteredTasks = (sectionId: string) => {
    const sectionTasks = tasks.filter((task) => task.section_id === sectionId)
    const filter = activeFilters[sectionId] || "all"
    if (filter === "all") return sectionTasks
    return sectionTasks.filter((task) => task.status === filter)
  }

  const getTaskCounts = (sectionId: string) => {
    const sectionTasks = tasks.filter((task) => task.section_id === sectionId)
    return {
      all: sectionTasks.length,
      pending: sectionTasks.filter((t) => t.status === "pending").length,
      "in-progress": sectionTasks.filter((t) => t.status === "in-progress").length,
      completed: sectionTasks.filter((t) => t.status === "completed").length,
    }
  }

  if (sectionsLoading) {
    return <div className="text-center py-12">Cargando secciones...</div>
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isExpanded = expandedSections[section.id]
        const currentFilter = activeFilters[section.id] || "all"
        const counts = getTaskCounts(section.id)
        const filteredTasks = getFilteredTasks(section.id)
        const sectionColor = tailwindToHex[section.color || ""] || "#3b82f6"

        return (
          <Card key={section.id} className="overflow-hidden">
            <div className="border-b bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => toggleSection(section.id)}>
                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </Button>

                  <div className="size-3 rounded-full" style={{ backgroundColor: sectionColor }} />

                  <h2 className="text-lg font-semibold">{section.name}</h2>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddTask(section.id)}
                    style={{ 
                      borderColor: sectionColor,
                      color: sectionColor
                    }}
                    className="hover:opacity-80"
                  >
                    <Plus className="size-4 mr-1.5" />
                    Agregar Tarea
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSection(section.id)}>
                      Eliminar sección
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isExpanded && (
                <div className="ml-11 mt-3 flex flex-wrap gap-2">
                  <Button
                    variant={currentFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(section.id, "all")}
                  >
                    Todas <span className="ml-1.5 text-xs opacity-70">({counts.all})</span>
                  </Button>
                  <Button
                    variant={currentFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(section.id, "pending")}
                  >
                    Pendientes <span className="ml-1.5 text-xs opacity-70">({counts.pending})</span>
                  </Button>
                  <Button
                    variant={currentFilter === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(section.id, "in-progress")}
                  >
                    En Progreso <span className="ml-1.5 text-xs opacity-70">({counts["in-progress"]})</span>
                  </Button>
                  <Button
                    variant={currentFilter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(section.id, "completed")}
                  >
                    Completadas <span className="ml-1.5 text-xs opacity-70">({counts.completed})</span>
                  </Button>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="divide-y">
                {tasksLoading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Cargando tareas...</div>
                ) : filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                      onEdit={handleOpenEditTask}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">No hay tareas en esta categoría</div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      <Button
        variant="outline"
        className="w-full border-dashed bg-transparent"
        onClick={() => setIsAddSectionModalOpen(true)}
      >
        <Plus className="mr-2 size-4" />
        Agregar nueva sección
      </Button>
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        sectionId={selectedSection}
        onCreate={async (payload) => {
          const { error } = await createTask({ ...(payload as any), section_id: selectedSection })
          if (error) alert("Error al crear tarea: " + error.message)
        }}
      />

      <AddSectionModal 
        isOpen={isAddSectionModalOpen} 
        onClose={() => setIsAddSectionModalOpen(false)} 
        onCreate={async (name, color) => {
          const { error } = await createSection(name, color)
          if (error) alert("Error al crear sección: " + error.message)
        }}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        task={taskBeingEdited}
        onUpdate={async (id, patch) => {
          const { error } = await updateTask(id, patch)
          if (error) alert("Error al actualizar tarea: " + error.message)
          else setIsEditTaskModalOpen(false)
        }}
      />
    </div>
  )
}