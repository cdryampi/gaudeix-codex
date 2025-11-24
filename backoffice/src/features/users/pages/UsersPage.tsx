import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        await usersApi.update(editingUser.id, data);
      } else {
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

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatPill
          icon={UsersIcon}
          label="Total"
          value={stats.total}
          tone="primary"
        />
        <StatPill icon={UserCheck} label="Activos" value={stats.active} />
        <StatPill icon={ShieldCheck} label="Admins" value={stats.admins} />
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : error ? (
            <div className="flex h-48 items-center justify-center text-red-500">
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
    </PageContainer>
  );
}

type StatPillProps = {
  icon: ElementType;
  label: string;
  value: number;
  tone?: "primary" | "neutral";
};

function StatPill({ icon: Icon, label, value, tone = "neutral" }: StatPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          tone === "primary" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
      <Badge variant="outline" className="ml-auto text-xs">
        En vivo
      </Badge>
    </div>
  );
}
