import { User } from "../types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Mail,
  Shield,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Wifi,
} from "lucide-react";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="w-full">
        <table className="w-full table-auto caption-bottom text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr className="[&_th]:px-5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold">
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <AvatarFallback className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                          {getInitials(user.name || user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {user.email || "Sin email"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {user.is_staff ? (
                      <Badge className="gap-1 bg-purple-50 text-purple-700 hover:bg-purple-50 dark:bg-purple-900/30 dark:text-purple-200">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="gap-1 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Usuario
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {user.is_active ? (
                      <Badge className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <Wifi className="h-3.5 w-3.5" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-rose-50 text-rose-700 hover:bg-rose-50 dark:bg-rose-900/30 dark:text-rose-200">
                        <UserIcon className="h-3.5 w-3.5" />
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-200"
                        onClick={() => onEdit(user)}
                        aria-label={`Editar ${user.username}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/30"
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
    </div>
  );
}

function getInitials(text: string) {
  if (!text) return "U";
  const parts = text.trim().split(" ");
  const initials =
    parts.length > 1
      ? parts[0].charAt(0) + parts[1].charAt(0)
      : text.slice(0, 2);
  return initials.toUpperCase();
}
