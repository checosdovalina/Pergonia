import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Printer, Eye, Check, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import logoPath from "@assets/pergonia_logo_transparent.png";
import jsPDF from "jspdf";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SimpleQuoteDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: any;
  onEdit?: (quote: any) => void;
}

export function SimpleQuoteDetail({ open, onOpenChange, quote, onEdit }: SimpleQuoteDetailProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  // Fetch project and client data
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Mutations for status changes
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiRequest("PUT", `/api/simple-quotes/${quote.id}`, {
        ...quote,
        status: newStatus
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      onOpenChange(false);
      toast({
        title: "Estatus actualizado",
        description: "El estatus de la cotización fue actualizado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const convertToServiceOrderMutation = useMutation({
    mutationFn: async () => {
      // Function to remove price information from text
      const removePriceInfo = (text: string) => {
        return text
          // Remove lines with dollar amounts
          .replace(/.*\$[\d,]+\.?\d*.*\n?/g, '')
          // Remove "TOTAL PROJECT COST" lines
          .replace(/.*TOTAL PROJECT COST.*\n?/g, '')
          // Remove "Project Breakdown:" header
          .replace(/Project Breakdown:\s*\n/g, '')
          // Remove bullet points with price patterns
          .replace(/• .*\$[\d,]+\.?\d*.*/g, '')
          // Remove empty lines
          .replace(/\n\s*\n/g, '\n')
          .trim();
      };
      
      // Prepare detailed scope of work without costs
      let serviceOrderDetails = "";
      
      // Add project information first
      const project = Array.isArray(projects) ? projects.find((p: any) => p.id === quote.projectId) : null;
      if (project) {
        serviceOrderDetails += `PROJECT: ${project.title}\n`;
        serviceOrderDetails += `SERVICE TYPE: ${project.serviceType}\n`;
        if (project.description) {
          serviceOrderDetails += `DESCRIPTION: ${project.description}\n\n`;
        }
      }
      
      // Process exterior breakdown if available to extract work items
      if (quote.exteriorBreakdown) {
        const exterior = quote.exteriorBreakdown;
        serviceOrderDetails += `WORK TO BE PERFORMED:\n\n`;
        
        // Extract enabled modules without costs
        Object.entries(exterior).forEach(([key, module]: [string, any]) => {
          if (module.enabled && module.subtotal > 0) {
            const moduleName = key.charAt(0).toUpperCase() + key.slice(1);
            
            if (key === 'boxes') {
              serviceOrderDetails += `• ${moduleName} (Soffit, Facia, Gutters) - Quantity: ${module.quantity}\n`;
            } else if (key === 'dormer' && module.quantity > 0) {
              serviceOrderDetails += `• ${moduleName} - ${module.complexity || 'standard'} type - Quantity: ${module.quantity}\n`;
            } else if (key === 'shutters' && module.lines) {
              module.lines.forEach((line: any) => {
                if (line.quantity > 0) {
                  serviceOrderDetails += `• ${moduleName} (${line.type}) - Quantity: ${line.quantity}\n`;
                }
              });
            } else if (key === 'miscellaneous' && module.lines) {
              module.lines.forEach((line: any) => {
                if (line.description) {
                  serviceOrderDetails += `• ${line.description}\n`;
                }
              });
            }
          }
        });
        serviceOrderDetails += `\n`;
      }
      
      // Add filtered scope of work (remove price information)
      if (quote.scopeOfWork) {
        const filteredScope = removePriceInfo(quote.scopeOfWork);
        if (filteredScope) {
          serviceOrderDetails += `ADDITIONAL WORK DETAILS:\n${filteredScope}\n\n`;
        }
      }
      
      // Add standard services
      serviceOrderDetails += `INCLUDED SERVICES:\n`;
      serviceOrderDetails += `• Prep: Power washing as needed, scraping and sanding, removing old caulk and re-caulking gaps\n`;
      serviceOrderDetails += `• Protection: Cover and protect all landscaping, walkways, and adjacent surfaces\n`;
      serviceOrderDetails += `• Clean-up: Complete site clean-up and proper disposal of all materials\n\n`;
      
      // Add notes if available (filter out price info)
      if (quote.notes) {
        const filteredNotes = removePriceInfo(quote.notes);
        if (filteredNotes) {
          serviceOrderDetails += `ADDITIONAL NOTES:\n${filteredNotes}\n\n`;
        }
      }
      
      // Fallback if no content
      if (!serviceOrderDetails.trim()) {
        serviceOrderDetails = "Service order created from quote - please review and add specific work details.";
      }

      const res = await apiRequest("POST", "/api/service-orders", {
        projectId: quote.projectId || undefined,
        clientId: client?.id || quote.clientId || undefined,
        workAddress: quote.workAddress || project?.address || "",
        quoteId: quote.id,
        details: serviceOrderDetails.trim(),
        status: "pending",
        images: project?.images || [],
        documents: project?.documents || []
      });
      return res.json();
    },
    onSuccess: () => {
      updateStatusMutation.mutate("converted");
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      onOpenChange(false);
      toast({
        title: "Orden de servicio creada",
        description: "La cotización fue convertida a orden de servicio exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al convertir",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!quote) return null;

  const project = (projects as any[])?.find((p: any) => p.id === quote.projectId) || null;
  const client =
    (clients as any[])?.find((c: any) => c.id === quote.clientId) ||
    (clients as any[])?.find((c: any) => c.id === project?.clientId) ||
    null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":     return "Borrador";
      case "sent":      return "Enviada";
      case "approved":  return "Aprobada";
      case "rejected":  return "Rechazada";
      case "converted": return "Convertida";
      default:          return status;
    }
  };

  const formatText = (text: string) => {
    if (!text) return "";
    
    return text.split('\n').map((line, index) => {
      // Check if line starts with bullet point indicators
      const bulletRegex = /^[\s]*[•\-\*✓]\s*/;
      if (bulletRegex.test(line)) {
        const cleanLine = line.replace(bulletRegex, '').trim();
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="text-blue-600 mr-2 mt-1">•</span>
            <span>{cleanLine}</span>
          </div>
        );
      }
      return (
        <div key={index} className={line.trim() ? "mb-1" : "mb-2"}>
          {line.trim() || <span className="h-2 block" />}
        </div>
      );
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    // Brand colors (RGB)
    const OLIVE   = [74,  94,  48]  as [number,number,number]; // #4a5e30
    const GOLD    = [201, 169, 98]  as [number,number,number]; // #c9a962
    const CREAM   = [245, 240, 232] as [number,number,number]; // #f5f0e8
    const DARK    = [40,  40,  40]  as [number,number,number];
    const GRAY    = [110, 110, 110] as [number,number,number];
    const LTGRAY  = [220, 220, 220] as [number,number,number];
    const WHITE   = [255, 255, 255] as [number,number,number];

    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();   // 210
      const H = pdf.internal.pageSize.getHeight();  // 297
      const M = 14; // margin
      let y = 0;

      const checkPage = (need: number = 20) => {
        if (y + need > H - 16) { pdf.addPage(); y = 16; }
      };

      const fmtMXN = (n: number) =>
        `$${Number(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;

      // ─── HEADER BAND ─────────────────────────────────────────────────────────
      pdf.setFillColor(...OLIVE);
      pdf.rect(0, 0, W, 36, "F");

      // Gold accent stripe
      pdf.setFillColor(...GOLD);
      pdf.rect(0, 36, W, 1.5, "F");

      // Logo
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const logoData: string = await new Promise((res, rej) => {
          img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.width; c.height = img.height;
            c.getContext("2d")!.drawImage(img, 0, 0);
            res(c.toDataURL("image/png"));
          };
          img.onerror = rej;
          img.src = logoPath;
        });
        pdf.addImage(logoData, "PNG", M, 5, 26, 26);
      } catch { /* no logo – skip */ }

      // Company name
      pdf.setTextColor(...WHITE);
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.text("PERGONIA", M + 30, 14);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text("ARQUITECTURA EXTERIOR", M + 30, 19);
      pdf.setFontSize(8);
      pdf.setTextColor(230, 220, 200);
      pdf.text("Torreón, Coahuila  ·  contacto@pergonia.mx  ·  www.pergonia.mx", M + 30, 25);

      // Quote badge (right side)
      pdf.setTextColor(...GOLD);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(`COTIZACIÓN #${quote.id}`, W - M, 15, { align: "right" });
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(230, 220, 200);
      pdf.text(`Fecha: ${format(new Date(quote.createdAt), "dd/MM/yyyy")}`, W - M, 21, { align: "right" });
      if (quote.validUntil) {
        pdf.text(`Válida hasta: ${format(new Date(quote.validUntil), "dd/MM/yyyy")}`, W - M, 26, { align: "right" });
      }
      pdf.text(`Estatus: ${getStatusLabel(quote.status)}`, W - M, 31, { align: "right" });

      y = 44;

      // ─── CLIENT / PROJECT INFO CARDS ─────────────────────────────────────────
      const cardW = (W - 2 * M - 6) / 2;
      const drawCard = (x: number, title: string, lines: string[], cardY: number) => {
        const lh = 4.5;
        const cardH = 8 + lines.length * lh + 4;
        pdf.setFillColor(...OLIVE);
        pdf.roundedRect(x, cardY, cardW, 8, 1, 1, "F");
        pdf.setFillColor(...CREAM);
        pdf.roundedRect(x, cardY + 8, cardW, cardH - 8, 1, 1, "F");
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(x, cardY, cardW, cardH, 1, 1, "S");

        pdf.setTextColor(...WHITE);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, x + 4, cardY + 5.5);

        pdf.setTextColor(...DARK);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        let ty = cardY + 13;
        lines.forEach(line => {
          const wrapped = pdf.splitTextToSize(line, cardW - 8);
          wrapped.forEach((l: string) => { pdf.text(l, x + 4, ty); ty += lh; });
        });
        return cardH;
      };

      const clientLines: string[] = [];
      if (client) {
        clientLines.push(`Nombre: ${client.name}`);
        if (client.phone)   clientLines.push(`Tel: ${client.phone}`);
        if (client.email)   clientLines.push(`Email: ${client.email}`);
        if (client.address) clientLines.push(`Dir: ${client.address}`);
      } else {
        clientLines.push("Sin cliente asignado");
      }

      const projectLines: string[] = [];
      const workAddr = quote.workAddress || project?.address;
      if (workAddr)        projectLines.push(`Dirección obra: ${workAddr}`);
      if (project?.title)  projectLines.push(`Proyecto: ${project.title}`);
      if (project?.serviceType) projectLines.push(`Tipo: ${project.serviceType}`);
      if (projectLines.length === 0) projectLines.push("Cotización directa");

      const h1 = drawCard(M,           "INFORMACIÓN DEL CLIENTE", clientLines, y);
      const h2 = drawCard(M + cardW + 6, "INFORMACIÓN DEL PROYECTO", projectLines, y);
      y += Math.max(h1, h2) + 8;

      // ─── DESCRIPTION ─────────────────────────────────────────────────────────
      const desc = quote.scopeOfWork || project?.description;
      if (desc && desc.trim()) {
        checkPage(20);
        pdf.setFillColor(...OLIVE);
        pdf.roundedRect(M, y, W - 2 * M, 7, 1, 1, "F");
        pdf.setTextColor(...WHITE);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("DESCRIPCIÓN / ALCANCE DEL TRABAJO", M + 3, y + 5);
        y += 10;

        pdf.setTextColor(...DARK);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        const lines = pdf.splitTextToSize(desc.trim(), W - 2 * M - 4);
        lines.forEach((l: string) => {
          checkPage(6);
          pdf.text(l, M + 2, y);
          y += 4.5;
        });
        y += 4;
      }

      // ─── PARTIDAS TABLE ───────────────────────────────────────────────────────
      const ext = quote.exteriorBreakdown || {};
      const partidas: any[] = ext._pergoniaPartidas || [];
      const servicios: any[] = (ext._pergoniaServicios || []).filter((s: any) => s.incluido);

      if (partidas.length > 0 || servicios.length > 0) {
        checkPage(24);

        // Section header
        pdf.setFillColor(...OLIVE);
        pdf.roundedRect(M, y, W - 2 * M, 7, 1, 1, "F");
        pdf.setTextColor(...WHITE);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("PARTIDAS Y CONCEPTOS DE OBRA", M + 3, y + 5);
        y += 9;

        // Column widths
        const colDesc = 82;
        const colUnit = 18;
        const colQty  = 16;
        const colPU   = 28;
        const colSub  = 32;
        const tblW    = colDesc + colUnit + colQty + colPU + colSub;
        const tX      = M;

        // Table header row
        pdf.setFillColor(...GOLD);
        pdf.rect(tX, y, tblW, 7, "F");
        pdf.setTextColor(...WHITE);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        let cx = tX + 2;
        pdf.text("Descripción",    cx, y + 5); cx += colDesc;
        pdf.text("Unidad",         cx, y + 5); cx += colUnit;
        pdf.text("Cant.",          cx, y + 5); cx += colQty;
        pdf.text("P. Unit.",       cx, y + 5); cx += colPU;
        pdf.text("Subtotal",       cx, y + 5);
        y += 7;

        let subtotalSum = 0;
        let rowIndex = 0;

        const drawRow = (desc: string, unidad: string, cant: string | number, pu: string, sub: number, bold = false) => {
          checkPage(8);
          const descLines = pdf.splitTextToSize(String(desc), colDesc - 4);
          const rowH = Math.max(6, descLines.length * 4.2 + 2);

          // Alternating background
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(...CREAM);
            pdf.rect(tX, y, tblW, rowH, "F");
          } else {
            pdf.setFillColor(255, 255, 255);
            pdf.rect(tX, y, tblW, rowH, "F");
          }

          // Grid lines
          pdf.setDrawColor(...LTGRAY);
          pdf.setLineWidth(0.2);
          pdf.rect(tX, y, tblW, rowH, "S");

          pdf.setTextColor(...DARK);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", bold ? "bold" : "normal");

          let rx = tX + 2;
          descLines.forEach((l: string, i: number) => {
            pdf.text(l, rx, y + 4.2 + i * 4.2);
          });
          rx += colDesc;
          pdf.text(String(unidad), rx, y + 4.2); rx += colUnit;
          pdf.text(String(cant),   rx, y + 4.2); rx += colQty;
          pdf.text(pu,             rx, y + 4.2); rx += colPU;
          pdf.text(fmtMXN(sub).replace(" MXN",""), rx, y + 4.2);

          subtotalSum += sub;
          y += rowH;
          rowIndex++;
        };

        // Partidas rows
        partidas.forEach((p: any) => {
          const sub = Number(p.subtotal) || (Number(p.cantidad || 1) * Number(p.precioUnitario || 0));
          const puLabel = p.precioUnitario ? fmtMXN(Number(p.precioUnitario)).replace(" MXN","") : "—";
          drawRow(p.descripcion || "—", p.unidad || "—", p.cantidad ?? 1, puLabel, sub);

          // Sub-conceptos
          const subItems: string[] = p.subItems || [];
          subItems.forEach((si: string) => {
            if (!si) return;
            checkPage(5);
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(7.5);
            pdf.setTextColor(...GRAY);
            pdf.text(`   • ${si}`, tX + 3, y + 3.5);
            y += 5;
          });

          // Nota / condición por partida
          if (p.nota) {
            checkPage(5);
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(7);
            pdf.setTextColor(160, 130, 60); // dorado suave
            pdf.text(`   ★ ${p.nota}`, tX + 3, y + 3.5);
            y += 5;
            pdf.setFont("helvetica", "normal");
          }
        });

        // Servicios rows (if any)
        if (servicios.length > 0) {
          checkPage(10);
          // Sub-header
          pdf.setFillColor(230, 240, 220);
          pdf.rect(tX, y, tblW, 6, "F");
          pdf.setTextColor(...OLIVE);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.text("Servicios incluidos", tX + 2, y + 4);
          y += 6;
          rowIndex = 0;

          servicios.forEach((s: any) => {
            drawRow(s.nombre || s.descripcion || "—", "Global", 1, fmtMXN(Number(s.precio || 0)).replace(" MXN",""), Number(s.precio || 0));
          });
        }

        // ─── TOTALS ───────────────────────────────────────────────────────────
        checkPage(22);
        y += 3;

        const totalFinal = Number(quote.totalEstimate) || subtotalSum;
        const totX = W - M - 70;
        const totW = 70;

        pdf.setFillColor(...CREAM);
        pdf.roundedRect(totX, y, totW, 22, 1, 1, "F");
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(totX, y, totW, 22, 1, 1, "S");

        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY);
        pdf.text("Subtotal:", totX + 4, y + 7);
        pdf.setTextColor(...DARK);
        pdf.text(fmtMXN(subtotalSum), totX + totW - 4, y + 7, { align: "right" });

        pdf.setFillColor(...OLIVE);
        pdf.rect(totX, y + 11, totW, 11, "F");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...WHITE);
        pdf.text("TOTAL:", totX + 4, y + 18);
        pdf.setTextColor(...GOLD);
        pdf.text(fmtMXN(totalFinal), totX + totW - 4, y + 18, { align: "right" });

        y += 28;
      } else {
        // Fallback: just show total
        checkPage(18);
        const totX = W - M - 70;
        const totW = 70;
        pdf.setFillColor(...OLIVE);
        pdf.roundedRect(totX, y, totW, 11, 1, 1, "F");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...WHITE);
        pdf.text("TOTAL:", totX + 4, y + 7.5);
        pdf.setTextColor(...GOLD);
        pdf.text(fmtMXN(Number(quote.totalEstimate)), totX + totW - 4, y + 7.5, { align: "right" });
        y += 16;
      }

      // ─── NOTES ───────────────────────────────────────────────────────────────
      if (quote.notes && quote.notes.trim()) {
        checkPage(18);
        pdf.setFillColor(...CREAM);
        pdf.roundedRect(M, y, W - 2 * M, 7, 1, 1, "F");
        pdf.setDrawColor(...GOLD);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(M, y, W - 2 * M, 7, 1, 1, "S");
        pdf.setTextColor(...OLIVE);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("NOTAS Y CONDICIONES", M + 3, y + 5);
        y += 10;
        pdf.setTextColor(...DARK);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        const nLines = pdf.splitTextToSize(quote.notes.trim(), W - 2 * M - 4);
        nLines.forEach((l: string) => { checkPage(6); pdf.text(l, M + 2, y); y += 4.5; });
        y += 4;
      }

      // ─── FOOTER ──────────────────────────────────────────────────────────────
      const footerY = H - 14;
      pdf.setFillColor(...OLIVE);
      pdf.rect(0, footerY, W, 14, "F");
      pdf.setFillColor(...GOLD);
      pdf.rect(0, footerY, W, 1, "F");
      pdf.setTextColor(230, 220, 200);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("¡Gracias por confiar en Pergonia — Arquitectura Exterior!", W / 2, footerY + 6, { align: "center" });
      pdf.text("Esta cotización tiene vigencia de 30 días a partir de la fecha indicada.", W / 2, footerY + 11, { align: "center" });

      const name = client?.name || project?.title || "cliente";
      pdf.save(`Cotizacion-${quote.id}-${name.substring(0, 25)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un error al generar el PDF. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Cotización #{quote.id}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(quote.status)}>
                {getStatusLabel(quote.status)}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {/* Status action buttons */}
                {quote.status === "draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate("sent")}
                    disabled={updateStatusMutation.isPending}
                  >
                    Enviar al Cliente
                  </Button>
                )}
                
                {quote.status === "sent" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate("approved")}
                      disabled={updateStatusMutation.isPending}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate("rejected")}
                      disabled={updateStatusMutation.isPending}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </>
                )}

                {quote.status === "approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => convertToServiceOrderMutation.mutate()}
                    disabled={convertToServiceOrderMutation.isPending}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {convertToServiceOrderMutation.isPending ? "Convirtiendo..." : "Convertir a Orden de Servicio"}
                  </Button>
                )}

                {/* WhatsApp */}
                <Button
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 gap-1.5"
                  onClick={() => {
                    const phone = client?.phone?.replace(/\D/g, "");
                    const total = `$${Number(quote.totalEstimate || 0).toLocaleString("es-MX")} MXN`;
                    const name  = client?.name || "estimado cliente";
                    const addr  = quote.workAddress ? `\n📍 Dirección: ${quote.workAddress}` : "";
                    const msg   = `Hola ${name}, le comparto la *Cotización #${quote.id}* de Pergonia — Arquitectura Exterior.${addr}\n💰 Total: *${total}*\n\nPor favor confirme si tiene alguna duda o si desea proceder. ¡Estamos a sus órdenes!`;
                    const url   = phone
                      ? `https://wa.me/52${phone}?text=${encodeURIComponent(msg)}`
                      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                    window.open(url, "_blank");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-white shrink-0">
                    <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.04 7.8L.5 31.5l7.94-2.08A15.46 15.46 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm7.24 18.32c-.4-.2-2.35-1.16-2.71-1.29-.36-.13-.62-.2-.88.2s-1.01 1.29-1.24 1.55c-.23.26-.46.3-.86.1-.4-.2-1.69-.62-3.22-1.98-1.19-1.06-1.99-2.36-2.22-2.76-.23-.4-.02-.61.17-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.27.07-.5-.03-.7-.1-.2-.88-2.12-1.2-2.9-.32-.76-.64-.66-.88-.67h-.75c-.26 0-.69.1-1.05.49-.36.4-1.37 1.34-1.37 3.27s1.4 3.79 1.6 4.05c.2.26 2.76 4.21 6.68 5.91 4.69 2 4.69 1.33 5.53 1.25.84-.08 2.71-1.11 3.09-2.18.38-1.07.38-1.99.27-2.18-.11-.2-.37-.3-.77-.5z"/>
                  </svg>
                  WhatsApp
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  {isGeneratingPDF ? "Generando..." : "PDF"}
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(quote)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Header */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <img 
                  src={logoPath} 
                  alt="Pergonia Logo" 
                  className="h-16 w-auto object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PERGONIA</h1>
                  <p className="text-sm text-[#4a5e30] font-medium">Arquitectura Exterior</p>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>Torreón, Coahuila, México</p>
                    <p>contacto@pergonia.mx</p>
                    <p>www.pergonia.mx</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">Cotización #{quote.id}</h2>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Fecha:</span> {format(new Date(quote.createdAt), "dd/MM/yyyy")}</p>
                  <p><span className="font-medium">Estatus:</span> <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(quote.status)}`}>{getStatusLabel(quote.status)}</span></p>
                  {quote.validUntil && (
                    <p><span className="font-medium">Válida hasta:</span> {format(new Date(quote.validUntil), "dd/MM/yyyy")}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project and Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT: Client info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Nombre:</span>
                  <p className="text-gray-900">{client?.name || "—"}</p>
                </div>
                {client?.email && (
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                )}
                {client?.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <p className="text-gray-900">{client.phone}</p>
                  </div>
                )}
                {client?.address && (
                  <div>
                    <span className="font-medium text-gray-700">Dirección cliente:</span>
                    <p className="text-gray-900">{client.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Work / Project info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Obra</h3>
              <div className="space-y-3">
                {(quote.workAddress || project?.address) && (
                  <div>
                    <span className="font-medium text-gray-700">Dirección de la obra:</span>
                    <p className="text-gray-900">{quote.workAddress || project?.address}</p>
                  </div>
                )}
                {project?.title && (
                  <div>
                    <span className="font-medium text-gray-700">Proyecto:</span>
                    <p className="text-gray-900">{project.title}</p>
                  </div>
                )}
                {project?.serviceType && (
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <p className="text-gray-900">{project.serviceType}</p>
                  </div>
                )}
                {project?.description && (
                  <div>
                    <span className="font-medium text-gray-700">Descripción:</span>
                    <p className="text-gray-900">{project.description}</p>
                  </div>
                )}
                {!quote.workAddress && !project && (
                  <p className="text-gray-500 text-sm">Sin dirección de obra registrada</p>
                )}
              </div>
            </div>
          </div>

          {/* Servicios Pergonia */}
          {(() => {
            const eb = quote.exteriorBreakdown;
            const servicios: string[] = eb?._pergoniaServicios || [];
            const partidas: any[]     = eb?._pergoniaPartidas  || [];
            const LABEL: Record<string, string> = {
              alberca: "Alberca", deck: "Deck / Terraza", pergola: "Pérgola / Palapa",
              area_social: "Área Social", jardin: "Jardín", remodelacion: "Remodelación", otro: "Otro",
            };
            return (
              <>
                {/* Tipo de servicio */}
                {servicios.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Servicio</h3>
                    <div className="flex flex-wrap gap-2">
                      {servicios.map(s => (
                        <span key={s} className="inline-flex items-center px-3 py-1 rounded-full bg-[#4a5e30]/10 text-[#4a5e30] text-sm font-medium">
                          {LABEL[s] || s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partidas */}
                {partidas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Partidas de Obra</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 grid grid-cols-12 gap-1 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <div className="col-span-5">Descripción</div>
                        <div className="col-span-2 text-center">Unidad</div>
                        <div className="col-span-2 text-right">Cantidad</div>
                        <div className="col-span-1 text-right">P. Unit.</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                      </div>
                      <div className="divide-y">
                        {partidas.map((p: any, i: number) => {
                          const sub = (p.cantidad || 1) * (p.precioUnitario || 0);
                          const subItems: string[] = p.subItems || [];
                          return (
                            <div key={i}>
                              <div className="grid grid-cols-12 gap-1 px-4 py-2.5 text-sm">
                                <div className="col-span-5 font-medium text-gray-900">{p.descripcion}</div>
                                <div className="col-span-2 text-center text-gray-500">{p.unidad}</div>
                                <div className="col-span-2 text-right text-gray-700">{p.cantidad}</div>
                                <div className="col-span-1 text-right text-gray-700">
                                  ${Number(p.precioUnitario || 0).toLocaleString("es-MX")}
                                </div>
                                <div className="col-span-2 text-right font-semibold text-[#4a5e30]">
                                  ${sub.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              {/* Sub-conceptos */}
                              {subItems.filter(Boolean).length > 0 && (
                                <ul className="px-6 pb-2 space-y-0.5">
                                  {subItems.filter(Boolean).map((si: string, j: number) => (
                                    <li key={j} className="flex items-start gap-1.5 text-xs text-gray-500">
                                      <span className="text-[#4a5e30] mt-px">•</span>
                                      <span>{si}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {/* Nota por partida */}
                              {p.nota && (
                                <p className="px-6 pb-2.5 text-[11px] italic text-amber-700">
                                  ★ {p.nota}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Alcance del Trabajo */}
          {quote.scopeOfWork && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Alcance del Trabajo</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-900 leading-relaxed">
                  {formatText(quote.scopeOfWork)}
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Costo Total del Proyecto:</h3>
              <span className="text-2xl font-bold text-[#4a5e30]">
                ${Number(quote.totalEstimate || 0).toLocaleString("es-MX")} MXN
              </span>
            </div>
          </div>

          {/* Notas Internas */}
          {quote.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notas Internas</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{quote.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}