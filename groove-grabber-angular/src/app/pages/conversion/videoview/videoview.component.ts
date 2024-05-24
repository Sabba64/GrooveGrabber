import {Component, Input} from '@angular/core';
import {Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BackendService} from "../../../services/backend.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-videoview',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './videoview.component.html',
  styleUrl: './videoview.component.css',
})
export class VideoviewComponent {
  subscription: Subscription;
  showVideoCard: boolean = false;
  thumbnailUrl: string | null = null;
  title: string | null = null;
  author: string | null = null;
  videoUrl: string | null = null;
  channelUrl: string | null = null;
  videoEmbed: SafeResourceUrl | null = null;
  downloads: number | null = null;
  views: number | null = null;
  isLoading: boolean = false;
  isError: boolean = false;

  @Input() titleInput!: string | null;
  @Input() artistInput!: string | null;
  @Input() albumInput!: string | null;
  @Input() filenameInput!: string | null;

  constructor(private dataService: DataService, private backendService: BackendService, private sanitizer: DomSanitizer) {
    this.subscription = this.dataService.data$.subscribe(data => {
      console.log('received ID:' + data);
      if(data == ''){
        return;
      }
      //TODO: Ladesymbol?
      this.loadVideoInfoFromId(data)
        .then(() => {

        })
        .catch(e => {
          //TODO: Fehlermeldung?
          this.isError = true;
          this.showVideoCard = true;
        })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadVideoInfoFromId(videoId: string) {
    this.isError = false;
    let reqUrl = new URL("http://localhost:3000/videoInfo");
    reqUrl.searchParams.append("id", encodeURIComponent(videoId));
    this.backendService.getJson(reqUrl.toString()).subscribe({
      next: json => {
        if (!json || json.error) {
          //TODO: Fehlermeldung?
          this.isError = true;
          this.showVideoCard = true;
        }
        else{
          this.thumbnailUrl = json['thumbnail_url'].substring(0, json['thumbnail_url'].lastIndexOf('/') + 1) + "maxresdefault.jpg";
          this.title = json['title'];
          this.author = json['author_name']
          this.videoUrl = json['videoUrl'];
          this.channelUrl = json['author_url'];
          this.videoEmbed = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + videoId);
          this.downloads = json['downloads'];
          this.views = json['views'];
        }
      },
      error: e => {
        this.isError = true;
        this.showVideoCard = true;
      },
      complete: () => {
        this.showVideoCard = true;
      }
    });
  }

  downloadAudio(): void {
    if(this.videoUrl == null || this.title == null || this.author == null) {
      //TODO: Fehlermeldung?
      this.isError = true;
      this.showVideoCard = true;
      return;
    }
    let title;
    let artist;

    if(this.titleInput != null && this.titleInput != '') {
      title = this.titleInput
    }
    else {
      title = this.title;
    }

    if(this.artistInput != null && this.artistInput != '') {
      artist = this.artistInput
    }
    else {
      artist = this.author;
    }
    let audioUrl = new URL("http://localhost:3000/download");
    audioUrl.searchParams.append("url", encodeURIComponent(this.videoUrl));
    audioUrl.searchParams.append("title", encodeURIComponent(title));
    audioUrl.searchParams.append("artist", encodeURIComponent(artist));
    if(this.albumInput != null && this.albumInput != '') {
      audioUrl.searchParams.append("album", encodeURIComponent(this.albumInput));
    }

    let filename;
    if(this.filenameInput != null && this.filenameInput != ''){
      let indexOfPoint = this.filenameInput.indexOf('.');
      let reverseIndexOfPoint = (this.filenameInput.length - indexOfPoint - 1);
      if(indexOfPoint !== -1 && (reverseIndexOfPoint == 3 || reverseIndexOfPoint == 4)){
        filename = this.filenameInput.substring(0, indexOfPoint);
      }
      else{
        filename = this.filenameInput;
      }
    }
    else{
      filename = title;
    }

    console.log('download audio');
    this.isLoading = true;
    this.backendService.downloadFile(audioUrl.toString(), filename)
      .then(() => {
        if(this.downloads != null){
          this.downloads = this.downloads + 1;
        }
      })
      .catch((err) => {
        //TODO: Fehlermeldung?
        this.isError = true;
        this.showVideoCard = true;
      })
      .finally(() =>{
        this.isLoading = false;
      });
  }
}
