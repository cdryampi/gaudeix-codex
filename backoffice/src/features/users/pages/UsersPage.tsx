import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, ShieldCheck, Users as UsersIcon, UserCheck } from "lucide-react";
import { UsersTable } from "../components/UsersTable";
import { UserDialog } from "../components/UserDialog";
import { CreateUserDTO, User } from "../types";
import { usersApi } from "../api/users";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const admins = users.filter((u) => u.is_staff).length;
    return { total, active, admins };
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    setDeleteUserId(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;

    try {
      await usersApi.delete(deleteUserId);
      await fetchUsers();
      toast.success("Usuario eliminado correctamente");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Error al eliminar el usuario");
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleSubmit = async (data: CreateUserDTO) => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, data);
        toast.success("Usuario actualizado correctamente");
      } else {
        await usersApi.create(data);
        toast.success("Usuario creado correctamente");
      }
      setIsDialogOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Error al guardar el usuario");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total usuarios
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Activos
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Administradores
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.admins}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-destructive">
              {error}
            </div>
          ) : (
            <UsersTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        user={editingUser}
      />

      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
