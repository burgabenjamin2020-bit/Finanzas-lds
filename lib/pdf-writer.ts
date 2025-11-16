import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { FormularioGastosData } from "../types/form";

// Función para formatear fecha al estilo peruano
function formatearFechaPeruana(fechaString: string): string {
  const fecha = new Date(fechaString);
  
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  
  return `${dia} de ${mes} de ${año}`;
}

export async function fillPDFTemplate(
  data: FormularioGastosData
): Promise<Uint8Array> {
  // Cargar el PDF plantilla
  const templateUrl = "/templates/plantilla-gastos.pdf";
  const existingPdfBytes = await fetch(templateUrl).then((res) =>
    res.arrayBuffer()
  );

  // Cargar el documento PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Cargar fuente
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Formatear fecha al estilo peruano
  const fechaFormateada = formatearFechaPeruana(data.fecha);

  // COORDENADAS OPTIMIZADAS - VERSIÓN 19 FINAL
  // El sistema de coordenadas PDF tiene origen en la esquina inferior izquierda

  // CAMPOS PRINCIPALES
  // NOMBRE DEL SOLICITANTE
  firstPage.drawText(data.nombreSolicitante, {
    x: 40,
    y: 675,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // FECHA (arriba) - Formato peruano - Más a la izquierda
  firstPage.drawText(fechaFormateada, {
    x: 380,
    y: 675,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // NOMBRE DEL COBRADOR
  firstPage.drawText(data.nombreCobrador, {
    x: 40,
    y: 645,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });

  // PROPÓSITO DEL GASTO - Movido más a la izquierda y un poco más abajo
  firstPage.drawText(data.descripcionComplemento, {
    x: 100,
    y: 510,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // ORGANIZACIÓN
  const organizacionTexto =
    data.organizacion === "Otros"
      ? data.organizacionOtra || "Otros"
      : data.organizacion;
  firstPage.drawText(organizacionTexto, {
    x: 60,
    y: 425,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // MONTO TOTAL
  firstPage.drawText(`${data.montoTotal.toFixed(2)}`, {
    x: 250,
    y: 425,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // TABLA DE FIRMAS - CAMPOS FIJOS Y DINÁMICOS
  // Obispo/Pdte. de Rama (campo fijo)
  firstPage.drawText("Vianfo Malca Veliz", {
    x: 40,
    y: 245,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Fecha del Obispo - Formato peruano - Más a la izquierda
  firstPage.drawText(fechaFormateada, {
    x: 380,
    y: 245,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Secretario (campo fijo)
  firstPage.drawText("Benjamin Burga Alcala", {
    x: 40,
    y: 220,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Fecha del Secretario - Formato peruano - Más a la izquierda
  firstPage.drawText(fechaFormateada, {
    x: 380,
    y: 220,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Cobrador (campo dinámico del usuario)
  firstPage.drawText(data.nombreCobrador, {
    x: 40,
    y: 195,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Fecha del Cobrador - Formato peruano - Más a la izquierda
  firstPage.drawText(fechaFormateada, {
    x: 380,
    y: 195,
    size: 9,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Serializar el PDF modificado
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}