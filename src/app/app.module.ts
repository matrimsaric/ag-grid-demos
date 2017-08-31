import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';


import {AgGridModule} from 'ag-grid-angular/main';
import { GridBaseComponent } from './grid-base/grid-base.component';
import { TxtGrid } from './grid-base/txt-grid';
import "ag-grid-enterprise";

@NgModule({
  declarations: [
    AppComponent,
    GridBaseComponent,
    TxtGrid
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgGridModule.withComponents([]),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {

    }

 }
