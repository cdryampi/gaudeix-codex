import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { beachSafetyApi } from "../api/beachSafety";
import {
  BeachSafetyFlag,
  type BeachSafetyProposal,
  type BeachSafetyRun,
  type BeachSafetyStatus,
} from "../types";

export function BeachSafetyPage() {
  const [statusData, setStatusData] = useState<BeachSafetyStatus | null>(null);
  const [proposals, setProposals] = useState<BeachSafetyProposal[]>([]);
  const [runs, setRuns] = useState<BeachSafetyRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [runningCheck, setRunningCheck] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const pendingProposal = useMemo(
    () =>
      statusData?.latest_pending_proposal ??
      proposals.find((proposal) => proposal.review_status === "pending") ??
      null,
    [proposals, statusData],
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusResponse, proposalsResponse, runsResponse] =
        await Promise.all([
          beachSafetyApi.getStatus(),
          beachSafetyApi.listProposals(),
          beachSafetyApi.listRuns(),
        ]);
      setStatusData(statusResponse);
      setProposals(proposalsResponse);
      setRuns(runsResponse);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el estado de seguridad de playas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRunCheck = async () => {
    try {
      setRunningCheck(true);
      await beachSafetyApi.runCheck();
      toast.success("Revision manual lanzada");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo lanzar la revision manual");
    } finally {
      setRunningCheck(false);
    }
  };

  const handleReview = async (
    proposalId: number,
    action: "approve" | "reject",
  ) => {
    try {
      setReviewingId(proposalId);
      if (action === "approve") {
        await beachSafetyApi.approveProposal(proposalId, reviewNotes);
        toast.success("Propuesta aprobada");
      } else {
        await beachSafetyApi.rejectProposal(proposalId, reviewNotes);
        toast.success("Propuesta descartada");
      }
      setReviewNotes("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo revisar la propuesta");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Seguridad de playas"
        description="Supervisa el estado global municipal, revisa propuestas automaticas y valida cambios manualmente."
        actions={
          <Button onClick={handleRunCheck} disabled={runningCheck}>
            <PlayCircle className="mr-2 h-4 w-4" />
            {runningCheck ? "Lanzando..." : "Revision manual"}
          </Button>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Cargando estado de seguridad...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : statusData ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard
              title="Estado publicado"
              icon={<ShieldCheck className="h-4 w-4" />}
              value={renderStatusBadge(statusData.published_status)}
              description={
                statusData.published_at
                  ? `Publicado el ${formatDateTime(statusData.published_at)}`
                  : "Sin publicacion manual reciente"
              }
            />
            <SummaryCard
              title="Propuesta pendiente"
              icon={<ShieldAlert className="h-4 w-4" />}
              value={
                pendingProposal ? (
                  renderStatusBadge(pendingProposal.recommended_status)
                ) : (
                  <Badge variant="secondary">Sin propuesta</Badge>
                )
              }
              description={
                pendingProposal
                  ? `Generada el ${formatDateTime(pendingProposal.proposed_at)}`
                  : "No hay propuesta pendiente de revision"
              }
            />
            <SummaryCard
              title="Ultima ejecucion"
              icon={<Clock3 className="h-4 w-4" />}
              value={
                statusData.latest_run ? (
                  renderRunBadge(statusData.latest_run.status)
                ) : (
                  <Badge variant="secondary">Sin ejecuciones</Badge>
                )
              }
              description={
                statusData.latest_run
                  ? formatDateTime(statusData.latest_run.started_at)
                  : "Aun no hay historial operativo"
              }
            />
          </div>

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ShieldQuestion className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Revision actual</h2>
              </div>

              {pendingProposal ? (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {renderStatusBadge(pendingProposal.recommended_status)}
                    <span className="text-sm text-muted-foreground">
                      Ventana{" "}
                      {formatDateTime(
                        pendingProposal.recommendation_window_start,
                      )}{" "}
                      -{" "}
                      {formatDateTime(
                        pendingProposal.recommendation_window_end,
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Motivos detectados</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {pendingProposal.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="review-notes"
                    >
                      Notas de revision
                    </label>
                    <Textarea
                      id="review-notes"
                      value={reviewNotes}
                      onChange={(event) => setReviewNotes(event.target.value)}
                      placeholder="Anade contexto municipal o la razon de la decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        void handleReview(pendingProposal.id, "approve")
                      }
                      disabled={reviewingId === pendingProposal.id}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aprobar propuesta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        void handleReview(pendingProposal.id, "reject")
                      }
                      disabled={reviewingId === pendingProposal.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Descartar propuesta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay ninguna propuesta pendiente en este momento.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <HistoryCard title="Historial de propuestas">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Propuesta</TableHead>
                    <TableHead>Revision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        {formatDateTime(proposal.proposed_at)}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(proposal.recommended_status)}
                      </TableCell>
                      <TableCell>
                        {renderReviewBadge(proposal.review_status)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {proposals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        Sin propuestas registradas.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </HistoryCard>

            <HistoryCard title="Historial de ejecuciones">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Disparo</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell>{formatDateTime(run.started_at)}</TableCell>
                      <TableCell className="capitalize">
                        {run.trigger}
                      </TableCell>
                      <TableCell>{renderRunBadge(run.status)}</TableCell>
                    </TableRow>
                  ))}
                  {runs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        Sin ejecuciones registradas.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </HistoryCard>
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}

function SummaryCard({
  title,
  icon,
  value,
  description,
}: {
  title: string;
  icon: ReactNode;
  value: ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div>{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function HistoryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function renderStatusBadge(status: BeachSafetyFlag) {
  if (status === "red") {
    return <Badge variant="destructive">Bandera roja</Badge>;
  }
  if (status === "yellow") {
    return <Badge variant="default">Precaucion</Badge>;
  }
  return <Badge variant="secondary">Normal</Badge>;
}

function renderReviewBadge(status: BeachSafetyProposal["review_status"]) {
  if (status === "approved") {
    return <Badge variant="default">Aprobada</Badge>;
  }
  if (status === "rejected") {
    return <Badge variant="outline">Descartada</Badge>;
  }
  return <Badge variant="secondary">Pendiente</Badge>;
}

function renderRunBadge(status: BeachSafetyRun["status"]) {
  if (status === "failed") {
    return <Badge variant="destructive">Fallida</Badge>;
  }
  if (status === "succeeded") {
    return <Badge variant="default">Correcta</Badge>;
  }
  if (status === "skipped") {
    return <Badge variant="outline">Sin cambios</Badge>;
  }
  if (status === "running") {
    return <Badge variant="secondary">En curso</Badge>;
  }
  return <Badge variant="secondary">Pendiente</Badge>;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin dato";
  }
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
