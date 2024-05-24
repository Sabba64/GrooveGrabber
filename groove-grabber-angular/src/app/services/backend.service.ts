import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) {  }

  downloadFile(fileUrl: string, filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
        try{
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;

          a.download = filename.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.mp3';
          a.click();
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
        catch(err) {
          reject(err);
        }
      });
    })
  }

  getJson(url: string): Observable<any> {
    return this.http.get(url, { responseType: 'json' });
  }
}
