"use client"

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

import { useState } from "react"

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate?: (name: string, color: string) => Promise<void> | void
}

const colors = [
  { name: "Azul", value: "bg-blue-500" },
  { name: "Púrpura", value: "bg-purple-500" },
  { name: "Verde", value: "bg-green-500" },
  { name: "Naranja", value: "bg-orange-500" },
  { name: "Rosa", value: "bg-pink-500" },
  { name: "Rojo", value: "bg-red-500" },
  { name: "Amarillo", value: "bg-yellow-500" },
  { name: "Cyan", value: "bg-cyan-500" },
]

export function AddSectionModal({ isOpen, onClose, onCreate }: AddSectionModalProps) {
  const [name, setName] = useState("")
  const [selectedColor, setSelectedColor] = useState<string>(colors[0].value)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("El nombre de la sección es obligatorio")
      return
    }
    try {
      setIsSubmitting(true)
      await onCreate?.(name.trim(), selectedColor)
      // reset y cerrar
      setName("")
      setSelectedColor(colors[0].value)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva sección</DialogTitle>
          <DialogDescription>Agrega una nueva categoría para organizar tus tareas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-name">Nombre de la sección</Label>
            <Input 
              id="section-name" 
              placeholder="ej: Trabajo, Personal, Hobbies" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`flex items-center gap-2 rounded-md border p-2 hover:bg-muted ${
                    selectedColor === color.value ? "border-primary bg-muted" : ""
                  }`}
                >
                  <div className={`size-4 rounded-full ${color.value}`} />
                  <span className="text-sm">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear sección"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
