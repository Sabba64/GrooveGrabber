import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data = new BehaviorSubject<string>('');
  data$ = this.data.asObservable();

  setData(data: string) {
    this.data.next(data);
  }
}
