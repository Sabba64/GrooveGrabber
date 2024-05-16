import { Routes } from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {ContactComponent} from "./pages/contact/contact.component";
import {ConverterComponent} from "./pages/conversion/converter/converter.component";
import {PagenotfoundComponent} from "./pages/pagenotfound/pagenotfound.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'convert', component: ConverterComponent },
  { path: '404', component: PagenotfoundComponent },
  { path: ':videoid', component: ConverterComponent },
  { path: '**', component: PagenotfoundComponent },
];
