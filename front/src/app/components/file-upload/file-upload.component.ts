import { Component, signal, output, input } from '@angular/core';
import { DragDropDirective } from '../../directives/drag-drop.directive';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [DragDropDirective],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  label = input('Anexar arquivo (PDF)');
  maxFileSize = input(10 * 1024 * 1024);

  fileSelected = output<File>();
  fileRemoved = output<void>();

  selectedFile = signal<File | null>(null);
  errorMessage = signal('');

  handleFile(file: File): void {
    this.errorMessage.set('');

    if (file.type !== 'application/pdf') {
      this.errorMessage.set('Apenas arquivos PDF são permitidos');
      return;
    }

    if (file.size > this.maxFileSize()) {
      this.errorMessage.set(`Arquivo excede ${this.maxFileSize() / 1024 / 1024}MB`);
      return;
    }

    this.selectedFile.set(file);
    this.fileSelected.emit(file);
  }

  onFileDropped(files: FileList): void {
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.handleFile(input.files[0]);
      input.value = '';
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.fileRemoved.emit();
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
