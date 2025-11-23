import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Usuario
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Email
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Rol
            </th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
              Estado
            </th>
            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-muted-foreground">
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle font-medium">
                  {user.username}
                </td>
                <td className="p-4 align-middle">{user.email}</td>
                <td className="p-4 align-middle">{user.name || "-"}</td>
                <td className="p-4 align-middle">
                  {user.is_staff ? (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Usuario
                    </span>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      aria-label={`Editar ${user.username}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(user.id)}
                      aria-label={`Eliminar ${user.username}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
