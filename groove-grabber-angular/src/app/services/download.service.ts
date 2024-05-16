// src/app/download.service.ts

import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private http = inject(HttpClient);

  constructor() { }

  downloadFile(fileUrl: string, title: string): void {
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = title.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.mp3';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }
}
