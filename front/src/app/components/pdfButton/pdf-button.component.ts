import { Component, input, inject } from '@angular/core';
import { ToastService } from '../Toast/toast.service';
import { TableColumn } from '../Table/table.component';

@Component({
  selector: 'app-pdf-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="generatePdf()"
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-text-light text-sm font-bold hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
    >
      <span class="material-symbols-outlined text-[20px]">download</span>
      Exportar PDF
    </button>
  `,
})
export class PdfButtonComponent {
  private readonly toast = inject(ToastService);

  title = input.required<string>();
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();
  filename = input<string>('relatorio.pdf');

  async generatePdf(): Promise<void> {
    const loadingId = this.toast.warning({
      message: 'Gerando PDF...',
      title: 'Aguarde',
      duration: 0,
      closable: false,
    });

    try {
      const { jsPDF } = await import('jspdf');
      await new Promise(resolve => setTimeout(resolve, 300));

      const doc = new jsPDF('p', 'pt', 'a4');
      
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '550px';

      const cols = this.columns();
      const rows = this.data();

      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #111; padding: 20px; width: 550px; background-color: #ffffff;">
          <h2 style="color: #111827; font-size: 18px; font-weight: bold; margin-bottom: 5px;">${this.title()}</h2>
          <p style="color: #4b5563; font-size: 9px; margin-bottom: 20px;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f3f4f6; border-bottom: 1px solid #d1d5db;">
                ${cols.map(c => `<th style="text-align: left; padding: 6px; font-weight: bold; border: 1px solid #e5e7eb;">${c.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  ${cols.map(c => `<td style="padding: 6px; text-align: left; border: 1px solid #e5e7eb;">${row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      await doc.html(tempDiv, {
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 550,
      });
      doc.save(this.filename());
      this.toast.remove(loadingId);
      
      this.toast.success({
        message: 'PDF gerado com sucesso',
        title: 'Sucesso',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      this.toast.remove(loadingId);
      this.toast.error({
        message: 'Falha ao gerar o PDF',
        title: 'Erro',
      });
    }
  }
}
