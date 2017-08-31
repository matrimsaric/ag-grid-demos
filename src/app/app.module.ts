import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';


import {AgGridModule} from 'ag-grid-angular/main';
import { BaseGrid } from './grid-base/base-grid';
import "ag-grid-enterprise";
import { SourceGridComponent } from './source-grid/source-grid.component';
import { DestinationGridComponent } from './destination-grid/destination-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    BaseGrid,
    SourceGridComponent,
    DestinationGridComponent
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
