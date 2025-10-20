"use client"

import { useEffect, useState } from "react"
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

interface EditTaskModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | null
    onUpdate?: (id: string, payload: Partial<Task>) => Promise<void> | void
}

export function EditTaskModal({ isOpen, onClose, task, onUpdate }: EditTaskModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<Task["priority"]>("medium")
    const [status, setStatus] = useState<Task["status"]>("pending")
    const [date, setDate] = useState<string>("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (task) {
            setTitle(task.title || "")
            setDescription(task.description || "")
            setPriority(task.priority)
            setStatus(task.status)
            setDate(task.date || "")
            setTags(task.tags || [])
            setTagInput("")
        }
    }, [task])

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
        if (!task) return
        if (!title.trim()) {
            alert("El título es obligatorio")
            return
        }
        try {
            setIsSubmitting(true)
            await onUpdate?.(task.id, {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                status,
                date: date || null,
                tags,
            } as Partial<Task>)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar tarea</DialogTitle>
                    <DialogDescription>Modifica los campos de tu tarea</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input id="title" placeholder="Nombre de la tarea" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" placeholder="Describe los detalles de la tarea" rows={3} value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Prioridad</Label>
                            <Select value={priority} onValueChange={(v: string) => setPriority(v as Task["priority"])}>
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
                            <Select value={status} onValueChange={(v: string) => setStatus(v as Task["status"])}>
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

                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input id="date" type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} />
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
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
