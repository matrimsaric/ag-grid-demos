import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, GridCell, RowNode } from 'ag-grid/main';

import { BaseGrid } from '../grid-base/base-grid';

import { DragDropObject, DRAG_DROP_SOURCE } from  '../grid-base/drag-drop-object';


@Component({
  selector: 'source-grid',
  templateUrl: './source-grid.component.html'
})
export class SourceGridComponent implements OnInit {

  @ViewChild(BaseGrid) private baseGrid: BaseGrid;

  columnDefs;
  rowData;
  count: number = 4;

  private rowsSelected: any;// usually this is handled by tehe drag object since we are on the same window just track

  constructor() { 
    this.columnDefs = [
      {headerName: "Make", field: "make", editable: true},
      {headerName: "Price", field: "price"},
      {headerName: "", field: "id", hide: true }
  ];

  this.rowData = [
    {make: "Mustang", model: "Yellow", price: 35000, id: 0},
    {make: "Volkswagon", model: "Polo", price: 12000, id: 1},
    {make: "BMW", model: "5 Sereis", price: 24000, id: 2},
    {make: "Audi", model: "Yerrrk", price: 43000, id: 3},
];

  }

  ngOnInit() {

  }



  onGridReady(params) {
    params.api.sizeColumnsToFit();
}


  handleDragStart($event: any): void{
    var selectedNodes: RowNode[] = this.baseGrid.gridOptions.api.getSelectedNodes();
    
      var selectedEntities: {}[] = [];
      for (let node of selectedNodes) {
          selectedEntities.push(node.data);
      } 

      var dragO: DragDropObject = new DragDropObject();
      dragO.windowId  = this.baseGrid.gridId.toString();
      dragO.windowSource = DRAG_DROP_SOURCE.CAR_SOURCE;
      dragO.dragData = selectedEntities;
    
      var selectedEntitiesJSON: string = JSON.stringify(dragO);
    
      
      console.log('handledragstart');
    
      if ($event.dataTransfer) {
          $event.dataTransfer.effectAllowed = "move";
          $event.dataTransfer.setData("text", selectedEntitiesJSON);
      }
      else if (
          $event.originalEvent.dataTransfer) {
          $event.originalEvent.dataTransfer.effectAllowed = "move";
          $event.dataTransfer.setData("text", selectedEntitiesJSON);
      }
  }


}
