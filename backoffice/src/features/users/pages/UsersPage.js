import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
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
import { usersApi } from "../api/users";
export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(undefined);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const admins = users.filter((u) => u.is_staff).length;
    return { total, active, admins };
  }, [users]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = query
        ? `${user.username} ${user.name ?? ""} ${user.email ?? ""}`
            .toLowerCase()
            .includes(query)
        : true;
      const matchesRole =
        roleFilter === "all"
          ? true
          : roleFilter === "admin"
            ? user.is_staff
            : !user.is_staff;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? user.is_active
            : !user.is_active;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
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
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);
  const handleCreate = () => {
    setEditingUser(undefined);
    setIsDialogOpen(true);
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };
  const handleDelete = async (userId) => {
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
  const handleSubmit = async (data) => {
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
  return _jsxs(PageContainer, {
    children: [
      _jsx(PageHeader, {
        title: "Usuarios",
        description: "Gesti\u00F3n de usuarios del sistema",
        actions: _jsxs(Button, {
          onClick: handleCreate,
          size: "sm",
          children: [
            _jsx(Plus, { className: "mr-2 h-4 w-4" }),
            "Nuevo usuario",
          ],
        }),
      }),
      _jsxs("div", {
        className: "mb-6 grid gap-4 md:grid-cols-3",
        children: [
          _jsx(Card, {
            className: "border-border bg-card",
            children: _jsx(CardContent, {
              className: "p-4",
              children: _jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  _jsx("div", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10",
                    children: _jsx(UsersIcon, {
                      className: "h-5 w-5 text-primary",
                    }),
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("p", {
                        className: "text-sm font-medium text-muted-foreground",
                        children: "Total usuarios",
                      }),
                      _jsx("p", {
                        className: "text-2xl font-semibold text-foreground",
                        children: stats.total,
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          _jsx(Card, {
            className: "border-border bg-card",
            children: _jsx(CardContent, {
              className: "p-4",
              children: _jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  _jsx("div", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                    children: _jsx(UserCheck, {
                      className: "h-5 w-5 text-muted-foreground",
                    }),
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("p", {
                        className: "text-sm font-medium text-muted-foreground",
                        children: "Activos",
                      }),
                      _jsx("p", {
                        className: "text-2xl font-semibold text-foreground",
                        children: stats.active,
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          _jsx(Card, {
            className: "border-border bg-card",
            children: _jsx(CardContent, {
              className: "p-4",
              children: _jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  _jsx("div", {
                    className:
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                    children: _jsx(ShieldCheck, {
                      className: "h-5 w-5 text-muted-foreground",
                    }),
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("p", {
                        className: "text-sm font-medium text-muted-foreground",
                        children: "Administradores",
                      }),
                      _jsx("p", {
                        className: "text-2xl font-semibold text-foreground",
                        children: stats.admins,
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
      _jsxs("div", {
        className:
          "mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        children: [
          _jsxs("div", {
            className: "flex flex-1 flex-col gap-3 md:flex-row",
            children: [
              _jsx(Input, {
                placeholder: "Buscar por usuario, nombre o email",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                className: "md:max-w-sm",
              }),
              _jsxs("div", {
                className: "grid grid-cols-2 gap-2 md:flex",
                children: [
                  _jsxs("select", {
                    value: roleFilter,
                    onChange: (e) => setRoleFilter(e.target.value),
                    className:
                      "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    children: [
                      _jsx("option", {
                        value: "all",
                        children: "Todos los roles",
                      }),
                      _jsx("option", {
                        value: "admin",
                        children: "Administradores",
                      }),
                      _jsx("option", { value: "user", children: "Usuarios" }),
                    ],
                  }),
                  _jsxs("select", {
                    value: statusFilter,
                    onChange: (e) => setStatusFilter(e.target.value),
                    className:
                      "h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    children: [
                      _jsx("option", {
                        value: "all",
                        children: "Todos los estados",
                      }),
                      _jsx("option", { value: "active", children: "Activos" }),
                      _jsx("option", {
                        value: "inactive",
                        children: "Inactivos",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs(Badge, {
            variant: "secondary",
            className: "w-fit px-3 py-1 text-xs",
            children: [filtered.length, " usuarios"],
          }),
        ],
      }),
      _jsx(Card, {
        className: "border-border bg-card",
        children: _jsx(CardContent, {
          className: "p-0",
          children: loading
            ? _jsx("div", {
                className:
                  "flex h-48 items-center justify-center text-muted-foreground",
                children: "Cargando usuarios...",
              })
            : error
              ? _jsx("div", {
                  className:
                    "flex h-48 items-center justify-center text-destructive",
                  children: error,
                })
              : _jsx(UsersTable, {
                  users: paginated,
                  onEdit: handleEdit,
                  onDelete: handleDelete,
                }),
        }),
      }),
      _jsxs("div", {
        className:
          "mt-4 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between",
        children: [
          _jsxs("span", {
            children: [
              "P\u00E1gina ",
              page,
              " de ",
              totalPages,
              " \u2022 ",
              filtered.length,
              " resultados",
            ],
          }),
          _jsx("div", {
            className: "w-full md:w-auto",
            children: _jsx(Pagination, {
              page: page,
              totalPages: totalPages,
              onPageChange: setPage,
            }),
          }),
        ],
      }),
      _jsx(UserDialog, {
        open: isDialogOpen,
        onOpenChange: setIsDialogOpen,
        onSubmit: handleSubmit,
        user: editingUser,
      }),
      _jsx(AlertDialog, {
        open: deleteUserId !== null,
        onOpenChange: () => setDeleteUserId(null),
        children: _jsxs(AlertDialogContent, {
          children: [
            _jsxs(AlertDialogHeader, {
              children: [
                _jsx(AlertDialogTitle, {
                  children: "\u00BFEst\u00E1s seguro?",
                }),
                _jsx(AlertDialogDescription, {
                  children:
                    "Esta acci\u00F3n no se puede deshacer. El usuario ser\u00E1 eliminado permanentemente del sistema.",
                }),
              ],
            }),
            _jsxs(AlertDialogFooter, {
              children: [
                _jsx(AlertDialogCancel, { children: "Cancelar" }),
                _jsx(AlertDialogAction, {
                  onClick: handleDeleteConfirm,
                  className:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  children: "Eliminar",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
