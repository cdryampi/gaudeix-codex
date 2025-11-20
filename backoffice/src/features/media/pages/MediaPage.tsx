import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function MediaPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Media"
        description="Gestión de archivos multimedia"
        actions={
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Subir Archivo
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">
          Galería de media y funcionalidad de upload se implementará aquí...
        </p>
      </div>
    </PageContainer>
  );
}
