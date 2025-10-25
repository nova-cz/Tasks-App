"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, MoreVertical, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/types/database"

interface TaskItemProps {
  task: Task
  onToggleStatus?: (taskId: string, newStatus: Task["status"]) => void
  onDelete?: (taskId: string) => void
  onEdit?: (task: Task) => void
  sectionColor?: string
}

export function TaskItem({ task, onToggleStatus, onDelete, onEdit, sectionColor }: TaskItemProps) {
  const priorityColors = {
    low: "text-muted-foreground",
    medium: "text-chart-3",
    high: "text-destructive",
  }

  const statusColors = {
    pending: "bg-secondary text-secondary-foreground",
    "in-progress": "bg-primary text-primary-foreground",
    completed: "bg-accent text-accent-foreground",
  }

  const statusLabels = {
    pending: "Pendiente",
    "in-progress": "En Progreso",
    completed: "Completada",
  }

  const handleToggleComplete = () => {
    if (onToggleStatus) {
      const newStatus = task.status === "completed" ? "pending" : "completed"
      onToggleStatus(task.id, newStatus)
    }
  }

  // Función helper para formatear la fecha correctamente
  const formatDate = (dateString: string) => {
    // Parsear la fecha como fecha local (no UTC)
    const [year, month, day] = dateString.split('-').map(Number)
    const localDate = new Date(year, month - 1, day)
    return localDate.toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-4 transition-all hover:bg-muted/30">
      <div className="flex items-start gap-4">
        <Checkbox 
          checked={task.status === "completed"} 
          className="mt-1 task-checkbox"
          onCheckedChange={handleToggleComplete}
          style={sectionColor ? { ['--section-color' as any]: sectionColor } : undefined}
        />

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`font-medium leading-relaxed ${
                  task.status === "completed" ? "line-through" : ""
                }`}
                style={task.status === 'completed' && sectionColor ? { color: sectionColor } : undefined}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{task.description}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(task.id)}>
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select 
              value={task.status} 
              onValueChange={(newStatus: string) => onToggleStatus?.(task.id, newStatus as Task["status"])}
            >
              <SelectTrigger className="h-7 w-auto border-0 bg-transparent px-2 text-xs font-medium hover:bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Flag className={`size-3 ${priorityColors[task.priority]}`} />
              <span className="capitalize">
                {task.priority === "low" ? "Baja" : task.priority === "medium" ? "Media" : "Alta"}
              </span>
            </div>

            {task.date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-3" />
                <span>{formatDate(task.date)}</span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}