import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, GridCell, RowNode } from 'ag-grid/main';

import { BaseGrid } from '../grid-base/base-grid';

import { DragDropObject, DRAG_DROP_SOURCE } from  '../grid-base/drag-drop-object';
// params for above
interface RowDataTransaction {
    
        // rows to add
        add?: any[];
        // index for rows to add
        addIndex?: number,
    
        // rows to remove
        remove?: any[];
    
        // rows to update
        update?: any[];
    }

@Component({
  selector: 'destination-grid',
  templateUrl: './destination-grid.component.html'
})
export class DestinationGridComponent implements OnInit {

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
      {make: "Toyota", model: "Celica", price: 35000, id: 0},
      {make: "Ford", model: "Mondeo", price: 32000, id: 1},
      {make: "Porsche", model: "Boxter", price: 72000, id: 2},
      {make: "Volkswagon", model: "Golf", price: 21000, id: 3},
      {make: "Ford", model: "Fiesta", price: 14000, id: 4},
      {make: "Ford", model: "Focus", price: 24000, id: 5}
  ];

  }

  ngOnInit() {

  }



  onGridReady(params) {
    params.api.sizeColumnsToFit();
}

testAdd(): void{
  console.log('testing addition');
  var focusedCell: GridCell = this.baseGrid.gridOptions.api.getFocusedCell();
  var newRowIndex: number = 0;
  if(focusedCell && focusedCell.rowIndex){
      newRowIndex = focusedCell.rowIndex;
  }
  
  //generate dummy blank row data with id to mimic server response
  var data: any = {make: "", model: "", price: 0, id: this.count};
  this.count += 1;

  var result: any = this.baseGrid.gridOptions.api.updateRowData({add: [data], addIndex:newRowIndex});

  // try and add the row to the background data
    var dumpArray: any[] = [];
  // loop the data and add at index
   if(this.rowData && this.rowData.length > 0){
      for(var index:number = 0; index < this.rowData.length; index++){
          if(index == newRowIndex){
              dumpArray.push(data);
          }

          dumpArray.push(this.rowData[index]);
      }
  } else {
      dumpArray.push(data);
  }

  this.rowData = dumpArray;

  // now set focused cell
  this.baseGrid.gridOptions.api.setFocusedCell(newRowIndex, "name");

  
}

getUserRowIndex(): number{
    var focusedCell: GridCell = this.baseGrid.gridOptions.api.getFocusedCell();
    var insertAtRow: number = 0;
    if (focusedCell) {
        insertAtRow = focusedCell.rowIndex;
    }
    return insertAtRow;
}

testInsertOriginal(): void{
    var rowData: any = {make: "Skoda", model: "Bin", price: 45, id: this.count};
    this.count += 1;
     // deprectated in ag-grid but cannot get adjusted methods to work!
     this.baseGrid.gridOptions.api.insertItemsAtIndex(this.getUserRowIndex(), [rowData]);
     
    
}

testInsertNew(): void{
    var rowData: any = {make: "Skoda", model: "BiggerBin", price: 455, id: this.count};
    this.count += 1;
   

    var result: any = this.baseGrid.gridOptions.api.updateRowData({add: [rowData], addIndex: this.getUserRowIndex()});
}


private handleDragOver($event: any): void{
    if ($event.preventDefault) {
        $event.preventDefault(); // Necessary. Allows us to drop.
      }
      if($event.dataTransfer){
        $event.dataTransfer.dropEffect = "move";
      }
      
  }

  private handleDrop(ev: any): void {
    var masterDrag: DragDropObject = JSON.parse(ev.dataTransfer.getData("text"));
   
    
    for (let item of masterDrag.dragData) {
        var column: {} = {};
        if (masterDrag.windowSource == DRAG_DROP_SOURCE.CAR_SOURCE) {
            this.baseGrid.gridOptions.api.insertItemsAtIndex(this.getUserRowIndex(), [item]);
        }
    }
    // save changes to server...
              
     
  }

  

}
