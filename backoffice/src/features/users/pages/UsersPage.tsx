import { useState, useEffect } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UsersTable } from "../components/UsersTable";
import { UserDialog } from "../components/UserDialog";
import { User, CreateUserDTO } from "../types";
import { usersApi } from "../api/users";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

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
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await usersApi.delete(userId);
        await fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error al eliminar el usuario.");
      }
    }
  };

  const handleSubmit = async (data: CreateUserDTO) => {
    try {
      if (editingUser) {
        // Update
        await usersApi.update(editingUser.id, data);
      } else {
        // Create
        await usersApi.create(data);
      }
      setIsDialogOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error al guardar el usuario.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        {loading ? (
          <p className="text-center text-gray-500">Cargando usuarios...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <UsersTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        user={editingUser}
      />
    </PageContainer>
  );
}
