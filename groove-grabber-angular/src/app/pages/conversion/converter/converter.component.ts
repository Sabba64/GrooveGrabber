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
  settingsOpen = false;
  urlInput: string | null = null;
  queryInput: string | null = null;

  titleInput: string | null = null;
  artistInput: string | null = null;
  albumInput: string | null = null;
  filenameInput: string | null = null;

  constructor(private route: ActivatedRoute, private dataService: DataService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.urlInput = params.get('videoid');
      if(!this.urlInput){
        this.route.queryParams.subscribe(params => {
          this.queryInput = params['v'];
          console.log(this.queryInput);
          if (this.queryInput != null) {
            this.processVideo(this.queryInput);
          }
        });
      }
      else{
        console.log(this.urlInput);
        if (this.urlInput != null) {
          this.processVideo(this.urlInput);
        }
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
        let urlParams = new URLSearchParams(url.substring(url.indexOf('?')));
        return urlParams.get('v');
      }
    }
  }

  onConvertClick() {
    if(this.urlInput != null && this.urlInput != '') {
      this.processVideo(this.urlInput);
    }
  }
}
