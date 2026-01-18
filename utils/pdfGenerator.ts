
import { NewsReport } from "../types";

export const downloadAsPDF = (report: NewsReport) => {
  // En una app real usaríamos jspdf, aquí simulamos la estructura para impresión
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <html>
      <head>
        <title>Reporte de Diseño - ${report.date}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
          h1 { color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .news-item { margin-bottom: 30px; }
          .title { font-weight: bold; font-size: 1.2em; color: #4338ca; }
          .source { font-style: italic; color: #64748b; font-size: 0.9em; }
          .summary { margin-top: 10px; }
          .footer { margin-top: 50px; font-size: 0.8em; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Reporte Diario: Diseño & Artes</h1>
        <p>Fecha: ${report.date}</p>
        <hr/>
        ${report.items.map(item => `
          <div class="news-item">
            <div class="title">${item.title}</div>
            <div class="source">${item.source} (${item.category})</div>
            <div class="summary">${item.summary}</div>
            <a href="${item.url}">${item.url}</a>
          </div>
        `).join('')}
        <div class="footer">Generado por Gemini Design News Hub - Almacenado en Google Drive /Gemini</div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};
