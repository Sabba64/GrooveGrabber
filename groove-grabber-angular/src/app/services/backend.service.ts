// src/app/backend.service.ts

import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) {  }

  downloadFile(fileUrl: string, filename: string): void {
    this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;

      a.download = filename.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.mp3';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }


}
