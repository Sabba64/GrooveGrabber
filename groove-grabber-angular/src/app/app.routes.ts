import { Routes } from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {ContactComponent} from "./pages/contact/contact.component";
import {ConverterComponent} from "./pages/conversion/converter/converter.component";
import {PagenotfoundComponent} from "./pages/pagenotfound/pagenotfound.component";

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'GrooveGrabber' },
  { path: 'contact', component: ContactComponent, title: 'Contact us' },
  { path: '404', component: PagenotfoundComponent },
  { path: 'convert', component: ConverterComponent, title: 'Convert' },
  { path: 'watch', component: ConverterComponent, title: 'Convert' },
  { path: ':videoid', component: ConverterComponent, title: 'Convert' },
  { path: '**', component: PagenotfoundComponent, title: '404 Page not found' },
];
