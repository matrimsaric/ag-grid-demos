import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, GridCell, RowNode } from 'ag-grid/main';

import { BaseGrid } from '../grid-base/base-grid';

import { DragDropObject, DRAG_DROP_SOURCE } from  '../grid-base/drag-drop-object';


@Component({
  selector: 'internal-grid',
  templateUrl: './internal-grid.component.html'
})
export class InternalGridComponent implements OnInit {

  @ViewChild(BaseGrid) private baseGrid: BaseGrid;


  columnDefs;
  rowData;
  count: number = 6;


  private rowsSelected: any;// usually this is handled by tehe drag object since we are on the same window just track

  constructor() { 
    this.columnDefs = [
      {headerName: "Make", field: "make", editable: true},
      {headerName: "Price", field: "price"},
      {headerName: "", field: "id", hide: true }
  ];

  this.rowData = [
      {make: "AA", model: "AAA", price: 1, id: 0},
      {make: "BB", model: "BBB", price: 2, id: 1},
      {make: "CC", model: "CCC", price: 3, id: 2},
      {make: "DD", model: "DDD", price: 4, id: 3},
      {make: "EE", model: "EEE", price: 5, id: 4},
      {make: "FF", model: "FFF", price: 6, id: 5}
  ];

  }

  ngOnInit() {

  }



  onGridReady(params) {
    params.api.sizeColumnsToFit();
}




private handleDragOver($event: any): void{
    if ($event.preventDefault) {
        $event.preventDefault(); // Necessary. Allows us to drop.
      }
      if($event.dataTransfer){
        $event.dataTransfer.dropEffect = "move";
      }
      
  }

  private internalDragDropSave(rows: any) {
    // carry out a save here


    // as this is a demo just replace the current datalist with the adjusted data list
    this.rowData = null;
    this.rowData = rows;
    
    
}



 

  

}
