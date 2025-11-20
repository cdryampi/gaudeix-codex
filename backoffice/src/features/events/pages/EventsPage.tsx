import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function EventsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Eventos"
        description="Gestión de eventos"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Button>
        }
      />

      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">
          Calendario y gestión de eventos se implementará aquí...
        </p>
      </div>
    </PageContainer>
  );
}
