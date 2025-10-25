"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Task } from "@/types/database"

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  sectionId: string
  sectionColor?: string
  onCreate?: (payload: Partial<Task>) => Promise<void> | void
}

export function AddTaskModal({ isOpen, onClose, sectionId, sectionColor = "#3b82f6", onCreate }: AddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [status, setStatus] = useState<Task["status"]>("pending")
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Establecer la fecha de hoy por defecto cuando se abre el modal
  useEffect(() => {
    if (isOpen && !date) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      setDate(`${year}-${month}-${day}`)
    }
  }, [isOpen])

  // Hacer disponible el color de la sección globalmente mientras el modal esté abierto
  useEffect(() => {
    if (!isOpen) return
    const root = document.documentElement
    const prev = root.style.getPropertyValue('--section-color')
    root.style.setProperty('--section-color', sectionColor)
    root.classList.add('section-color-active')
    return () => {
      if (prev) root.style.setProperty('--section-color', prev)
      else root.style.removeProperty('--section-color')
      root.classList.remove('section-color-active')
    }
  }, [isOpen, sectionColor])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("El título es obligatorio")
      return
    }
    try {
      setIsSubmitting(true)
      await onCreate?.({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        date: date || null,
        time: time || null,
        tags,
        section_id: sectionId,
      } as Partial<Task>)
      // reset
      setTitle("")
      setDescription("")
      setPriority("medium")
      setStatus("pending")
      setDate("")
      setTime("")
      setTags([])
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl section-modal-color"
        style={{ '--section-color': sectionColor } as React.CSSProperties}
      >
        <DialogHeader>
          <DialogTitle>Crear nueva tarea</DialogTitle>
          <DialogDescription>Completa los detalles de tu nueva tarea</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input 
              id="title" 
              placeholder="Nombre de la tarea" 
              value={title} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              style={{ 
                borderColor: title ? sectionColor : undefined,
                outline: 'none'
              }}
              className="focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" placeholder="Describe los detalles de la tarea" rows={3} value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={(v: string) => setPriority(v as Task["priority"]) }>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(v: string) => setStatus(v as Task["status"]) }>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" value={time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Agregar etiqueta"
                value={tagInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-muted">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            style={{ backgroundColor: sectionColor, borderColor: sectionColor }}
            className="text-white hover:opacity-90"
          >
            {isSubmitting ? "Creando..." : "Crear tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}