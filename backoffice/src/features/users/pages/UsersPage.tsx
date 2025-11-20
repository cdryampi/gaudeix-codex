import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function UsersPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">
          Tabla de usuarios y funcionalidad CRUD se implementará aquí...
        </p>
      </div>
    </PageContainer>
  );
}
