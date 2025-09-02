import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const exportToExcel = (clients) => {
  const data = clients.map((client) => ({
    Nombre: client.name,
    Tipo: client.type === "individual" ? "Individual" : "Empresa",
    "Tipo de Documento": client.documentType.toUpperCase(),
    "Número de Documento": client.documentNumber,
    Email: client.email || "",
    Teléfono: client.phone || "",
    Dirección: client.address
      ? `${client.address.street || ""}, ${client.address.city || ""}, ${client.address.state || ""}, ${client.address.zipCode || ""}, ${client.address.country || ""}`
      : "",
    "Razón Social": client.businessInfo?.businessName || "",
    "Categoría Impositiva": client.businessInfo?.taxCategory || "",
    "Estado Impositivo": client.businessInfo?.taxStatus || "",
    "Límite de Crédito": client.creditLimit ? `$${client.creditLimit}` : "",
    "Plazo de Pago": client.paymentTerms ? `${client.paymentTerms} días` : "",
    Estado: client.status === "active" ? "Activo" : "Inactivo",
    "Fecha de Creación": new Date(client.createdAt).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  XLSX.writeFile(wb, "clientes.xlsx");
};

export const exportToPDF = (clients) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text("Reporte de Clientes", 14, 15);

  // Fecha
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

  // Tabla
  const tableData = clients.map((client) => [
    client.name,
    client.type === "individual" ? "Individual" : "Empresa",
    client.documentType.toUpperCase(),
    client.documentNumber,
    client.email || "",
    client.phone || "",
    client.creditLimit ? `$${client.creditLimit}` : "",
    client.paymentTerms ? `${client.paymentTerms} días` : "",
    client.status === "active" ? "Activo" : "Inactivo",
  ]);

  doc.autoTable({
    head: [
      [
        "Nombre",
        "Tipo",
        "Documento",
        "Número",
        "Email",
        "Teléfono",
        "Límite Crédito",
        "Plazo Pago",
        "Estado",
      ],
    ],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save("clientes.pdf");
};