import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
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
        }
        catch (err) {
            console.error("Error fetching users:", err);
            setError("Error al cargar los usuarios.");
        }
        finally {
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
    const handleEdit = (user) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };
    const handleDelete = async (userId) => {
        setDeleteUserId(userId);
    };
    const handleDeleteConfirm = async () => {
        if (!deleteUserId)
            return;
        try {
            await usersApi.delete(deleteUserId);
            await fetchUsers();
            toast.success("Usuario eliminado correctamente");
        }
        catch (err) {
            console.error("Error deleting user:", err);
            toast.error("Error al eliminar el usuario");
        }
        finally {
            setDeleteUserId(null);
        }
    };
    const handleSubmit = async (data) => {
        try {
            if (editingUser) {
                await usersApi.update(editingUser.id, data);
                toast.success("Usuario actualizado correctamente");
            }
            else {
                await usersApi.create(data);
                toast.success("Usuario creado correctamente");
            }
            setIsDialogOpen(false);
            await fetchUsers();
        }
        catch (err) {
            console.error("Error saving user:", err);
            toast.error("Error al guardar el usuario");
        }
    };
    return (_jsxs(PageContainer, { children: [_jsx(PageHeader, { title: "Usuarios", description: "Gesti\u00F3n de usuarios del sistema", actions: _jsxs(Button, { onClick: handleCreate, size: "sm", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "Nuevo usuario"] }) }), _jsxs("div", { className: "mb-6 grid gap-4 md:grid-cols-3", children: [_jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: _jsx(UsersIcon, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Total usuarios" }), _jsx("p", { className: "text-2xl font-semibold text-foreground", children: stats.total })] })] }) }) }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-muted", children: _jsx(UserCheck, { className: "h-5 w-5 text-muted-foreground" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Activos" }), _jsx("p", { className: "text-2xl font-semibold text-foreground", children: stats.active })] })] }) }) }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-muted", children: _jsx(ShieldCheck, { className: "h-5 w-5 text-muted-foreground" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Administradores" }), _jsx("p", { className: "text-2xl font-semibold text-foreground", children: stats.admins })] })] }) }) })] }), _jsx(Card, { className: "border-border bg-card", children: _jsx(CardContent, { className: "p-0", children: loading ? (_jsx("div", { className: "flex h-48 items-center justify-center text-muted-foreground", children: "Cargando usuarios..." })) : error ? (_jsx("div", { className: "flex h-48 items-center justify-center text-destructive", children: error })) : (_jsx(UsersTable, { users: users, onEdit: handleEdit, onDelete: handleDelete })) }) }), _jsx(UserDialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, onSubmit: handleSubmit, user: editingUser }), _jsx(AlertDialog, { open: deleteUserId !== null, onOpenChange: () => setDeleteUserId(null), children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEst\u00E1s seguro?" }), _jsx(AlertDialogDescription, { children: "Esta acci\u00F3n no se puede deshacer. El usuario ser\u00E1 eliminado permanentemente del sistema." })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: handleDeleteConfirm, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Eliminar" })] })] }) })] }));
}
