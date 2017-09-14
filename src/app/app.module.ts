import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';


import {AgGridModule} from 'ag-grid-angular/main';
import { BaseGrid } from './grid-base/base-grid';
import "ag-grid-enterprise";
import { SourceGridComponent } from './source-grid/source-grid.component';
import { DestinationGridComponent } from './destination-grid/destination-grid.component';
import { InternalGridComponent } from './internal-grid/internal-grid.component';
import { MaterialModule } from '@angular/material';
import { FocusGridComponent } from './focus-grid/focus-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    BaseGrid,
    SourceGridComponent,
    DestinationGridComponent,
    InternalGridComponent,
    FocusGridComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AgGridModule.withComponents([]),
    BrowserAnimationsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {

    }

 }
