import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, GridCell, RowNode } from 'ag-grid/main';

import { TxtGrid } from './txt-grid';

@Component({
  selector: 'app-grid-base',
  templateUrl: './grid-base.component.html',
  styleUrls: ['./grid-base.component.css']
})
export class GridBaseComponent implements OnInit {

  @ViewChild(TxtGrid) private txtGrid: TxtGrid;
  columnDefs;
  rowData;
  count: number = 6;

  constructor() { 
    this.columnDefs = [
      {headerName: "Make", field: "make", editable: true},
     // {headerName: "Model", field: "model", cellRendererFramework: RedComponentComponent},
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
  ]

  }

  ngOnInit() {

  }



  onGridReady(params) {
    params.api.sizeColumnsToFit();
}

testAdd(): void{
  console.log('testing addition');
  
  //generate dummy blank row data with id to mimic server response
  var data: any = {make: "", model: "", price: 0, id: this.count};
  this.count += 1;

  this.txtGrid.addNewRow(data, "make");

  // try and add the row to the background data
  var focusedCell: GridCell = this.txtGrid.gridOptions.api.getFocusedCell();
  var insertAtRow: number = 0;
  if (focusedCell) {
      insertAtRow = focusedCell.rowIndex;
  }
  var dumpArray: any[] = [];
  // loop the data and add at index
   if(this.rowData && this.rowData.length > 0){
      for(var index:number = 0; index < this.rowData.length; index++){
          if(index == insertAtRow){
              dumpArray.push(data);
          }

          dumpArray.push(this.rowData[index]);
      }
  } else {
      dumpArray.push(data);
  }

  this.rowData = dumpArray;

  // now set focused cell
  this.txtGrid.gridOptions.api.setFocusedCell(insertAtRow, "name");

  
}

getUserRowIndex(): number{
    var focusedCell: GridCell = this.txtGrid.gridOptions.api.getFocusedCell();
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
     this.txtGrid.gridOptions.api.insertItemsAtIndex(this.getUserRowIndex(), [rowData]);
     
    
}

testInsertNew(): void{
    var rowData: any = {make: "Skoda", model: "BiggerBin", price: 455, id: this.count};
    this.count += 1;

    var result: any = this.txtGrid.gridOptions.api.updateRowData({add: rowData, addIndex: this.getUserRowIndex()});
}




}
