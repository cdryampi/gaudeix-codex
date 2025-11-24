import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { CreateUserDTO, User } from "../types";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserDTO) => void;
  user?: User; // If provided, we are editing
}

export function UserDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
}: UserDialogProps) {
  const [formData, setFormData] = useState<CreateUserDTO>({
    username: "",
    email: "",
    name: "",
    password: "",
    password_confirm: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        name: user.name,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        name: "",
        password: "",
        password_confirm: "",
      });
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[600px] sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Modifica los datos del usuario aquí."
              : "Ingresa los datos del nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="username" className="text-right">
                Usuario
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="col-span-3 w-auto min-w-[220px] max-w-full"
                required
                disabled={!!user} // Username cannot be changed
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3 w-auto min-w-[220px] max-w-full"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="col-span-3 w-auto min-w-[220px] max-w-full"
                required
              />
            </div>
            {!user && (
              <>
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="col-span-3 w-auto min-w-[220px] max-w-full"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-3">
                  <Label htmlFor="password_confirm" className="text-right">
                    Confirmar
                  </Label>
                  <Input
                    id="password_confirm"
                    type="password"
                    value={formData.password_confirm || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirm: e.target.value,
                      })
                    }
                    className="col-span-3 w-auto min-w-[220px] max-w-full"
                    required
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">
              {user ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
