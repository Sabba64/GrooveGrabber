import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {VideoviewComponent} from "../videoview/videoview.component";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [
    FormsModule,
    VideoviewComponent
  ],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.css'
})
export class ConverterComponent {
  conversionStarted = false;
  urlInput: string | null = null;

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.urlInput = params.get('videoid');
      if (this.urlInput != null) {
        this.processVideo(this.urlInput);
      }
    });
  }

  processVideo(url: string): void {
    console.log('Starting conversion...');
    this.conversionStarted = true;

    let id = this.getIdFromUrl(url);

    if(id == null) {
      return;
      //TODO: Fehlermeldung
    }

    this.sendData(id);
  }

  sendData(id: string): void {
    this.dataService.setData(id);
  }

  getIdFromUrl(url: string) {
    if(url.indexOf('http') == -1){
      return url;
    }
    else {
      let index = url.indexOf('?v=');
      if(index == -1){
        return null;
      }
      else{
        return url.substring(url.indexOf('?v=') + 3);
      }
    }
  }

  onConvertClick() {
    if(this.urlInput != null && this.urlInput != '') {
      this.processVideo(this.urlInput);
    }
  }
}
