import { Component, OnInit, ViewChild } from '@angular/core';
import { GridOptions, GridCell, RowNode } from 'ag-grid/main';

import { BaseGrid, EditType } from '../grid-base/base-grid';

@Component({
  selector: 'app-focus-grid',
  templateUrl: './focus-grid.component.html'
})
export class FocusGridComponent implements OnInit {

  @ViewChild(BaseGrid) private baseGrid: BaseGrid;
  
    columnDefs;
    rowData;
    count: number = 4;

  constructor() { }

  ngOnInit() {

      this.columnDefs = [
        {headerName: "Clan", field: "clan", editable: true, },
        {headerName: "<span class='glyphicon glyphicon-pencil' style='color:black; float: middle' aria-hidden='true'></span>", 
            field: "comment", width: 25, editType: EditType.Comment},
        {headerName: "Color", field: "color"},
        {headerName: "", field: "id", hide: true }
    ];

      this.rowData = [
        {clan: "Crane", color: "Light Blue", comment: "" , price: 35000, id: 0},
        {clan: "Crab", color: "Dark Blue", comment: " Crab comment ", price: 12000, id: 1},
        {clan: "Dragon", color: "Green", comment: " Dragon comment ", price: 24000, id: 2},
        {clan: "Phoenix", color: "Orange", comment: "", price: 43000, id: 3},
        {clan: "Scorpion", color: "Red", comment: " Scorpion comment ", price: 35000, id: 0},
        {clan: "Lion", color: "Yellow", comment: "", price: 12000, id: 1},
        {clan: "Unicorn", color: "Purple", comment: "", price: 24000, id: 2},
    ];

  }

}
