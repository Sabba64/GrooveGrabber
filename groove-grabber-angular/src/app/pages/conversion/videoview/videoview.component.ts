import { Component } from '@angular/core';
import {Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import axios from "axios";
import {DownloadService} from "../../../services/download.service";

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
  isVideoDataReady: boolean = false;
  thumbnailUrl: string | null = null;
  title: string | null = null;
  author: string | null = null;
  videoUrl: string | null = null;
  channelUrl: string | null = null;

  titleInput: string | null = null;
  artistInput: string | null = null;
  albumInput: string | null = null;

  constructor(private dataService: DataService, private downloadService: DownloadService) {
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
        })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadVideoInfoFromId(videoId: string) {
    let videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
    let apiUrl = `https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`;
    try {
      console.log('Fetching video info...');
      let response = await axios.get(apiUrl);
      let json = response.data;
      this.thumbnailUrl = json['thumbnail_url'].substring(0, json['thumbnail_url'].lastIndexOf('/') + 1) + "maxresdefault.jpg";
      this.title = json['title'];
      this.author = json['author_name']
      this.videoUrl = videoUrl;
      this.channelUrl = json['author_url'];
      this.isVideoDataReady = true;
      console.log('Finished Loading Video Data');
    } catch (error) {
      throw Error("Could not load video info");
    }
  }

  downloadAudio(): void {
    if(this.videoUrl == null || this.title == null || this.author == null) {
      return;
      //TODO: Fehlermeldung?
    }
    let title;
    let artist;
    let album;

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

    console.log('download audio');

    this.downloadService.downloadFile(audioUrl.toString(), title);
  }
}
