// angular
import {Component,OnInit, AfterContentInit, Input, Output, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { CommonModule } from "@angular/common";

// ag-grid
import { AgGridNg2, BaseComponentFactory } from 'ag-grid-angular/main';
import { GridOptions, ColDef, RangeSelection, GridCell, ICellRenderer, ICellRendererParams, ICellRendererFunc, ICellEditor } from 'ag-grid/main';
import 'ag-grid-enterprise/main';


import { Observable } from 'rxjs/observable';
import { timer } from 'rxjs/observable/timer';


export enum GRID_ACCESS {
    ROW_ACTIONS = 0,
    EDIT_ACTIONS = 1,
    STARTUP = 2
}

enum VALIDATOR_FLAG {
    NOT_SET = 0,
    MANDATORY_COLUMN = 1,
    UNIQUE_COLUMN = 2,
    FORMAT_COLUMN = 4,
    EDIT_ON_CREATION = 5
}

enum CONTEXT_MENU {
    SELECT_DESELECT = 1,//0001    
    DRILL_ON = 2//0010
}

@Component({
    selector: 'txt-grid',
    providers: [ BaseComponentFactory ],
    templateUrl: './txt-grid.html',
})
export class TxtGrid implements OnChanges, OnInit {
    @Input() gridRows: any[]; // row data is passed as is to ag-grid

    // custom Grid properties
    // ======================
    @Input() gridCols: GridColDef[]; // this custom column definitions will be manipulated to what is required by ag-grid
    @Input() gridTitle: string = ""; // this is what will be dsiplayed as the title of the grid.
    @Input() showActionBar: boolean = false; // if true then the action bar will be displayed.
    @Input() enableRangeSelection: boolean = false;// if true then multi-select will be permitted if false or not provided then will not enable multi selection
    @Input() contextMenuChoice: number = 0; // this is a BIT flag field -- i.e use 1 to set select on own, 2 to select drill on own, 3 to select both select and drill

    @Input() rowSelection: string;
    @Input() suppressRowClickSelection: boolean = false;
    @Input() readOnly: boolean = false; //if true then all columns will be readonly.
    @Input() gridWidth: number = 272;
    @Input() gridHeight: number = 460;
    @Input() autoPinToColumn: number = -1;// if set above -1 then the code will attempt to pin the column to the left for that variable
    @Input() rowCellEditBlock: string = "";
e

    // custom events emitted
    // =====================
    @Output() rowSelected: EventEmitter<any> = new EventEmitter();
    @Output() onCellValueChangedEvent: EventEmitter<any> = new EventEmitter();
    @Output() onCellFocusedEvent: EventEmitter<any> = new EventEmitter();
    @Output() onSelectionChangedEvent: EventEmitter<any> = new EventEmitter();
    @Output() saveRequestEvent: EventEmitter<any> = new EventEmitter();// used to indicate the grid wishes a save to occur
    @Output() saveRequestAllDataEvent: EventEmitter<any> = new EventEmitter();// when changes are found, a single event is sent out with the grid data.
    @Output() onRowClickedEvent: EventEmitter<any> = new EventEmitter();
    @Output() gridColumnsFormattedEvent: EventEmitter<any> = new EventEmitter();

    public columnDefs: any[] = []; // ag-grid column definitions
    public gridOptions: GridOptions; // ag-grid options
    private gridId: Date = new Date();


    private contextMenuArray = [];

    // timer save columns
    private changesOutstanding: boolean = false;
    private gridTimer: Observable<number>;
    private inactivity: number = 0;
    private changedRows: any[] = [];
    private changedRowsIndex: number[] = [];
    private gridColumnsLoaded: boolean = false;

    // validation time savers
    private mandatoryColumns: string[] = [];
    private uniqueColumns: string[] = [];
    private formatColumns: string[] = [];
    private formatExpressionColumns: RegExp[] = [];
    private createEditColumn: string[] = [];


    constructor() {
    }

    ngOnInit() {

        var rowSelect: string = this.rowSelection;



        this.gridOptions = <GridOptions>{
            suppressRowClickSelection: this.suppressRowClickSelection,
            enableRangeSelection: this.enableRangeSelection,// passed in via the html from the calling page
            rowSelection: rowSelect,
            enableColResize: true,
            enableSorting: true,
            enableFilter: true,
            groupHeaders: true,
            toolPanelSuppressGroups: true,
            toolPanelSuppressValues: true,
            debug: false,
            groupUseEntireRow: true,
            groupRowInnerRenderer: this.groupRowInnerRendererFunc,
            icons: {
                groupExpanded: '<span class="glyphicon glyphicon-minus"  aria-hidden="true" style="color: DarkGreen"></span>',
                groupContracted: '<span class="glyphicon glyphicon-plus"  aria-hidden="true" style="color: DarkGreen"></span>'
            },
            onGridReady: () => {
                this.columnDefs = this.setupColumns(this.columnDefs, this.gridCols);
                this.setupRowData();
                this.gridOptions.api.setColumnDefs(this.columnDefs);
                this.gridOptions.api.setRowData(this.gridRows);
            },
            processRowPostCreate: (params) => {
                this.rowPostCreate(params);
            },
        };



      
        // set up timer to check for changes
        this.gridTimer = timer(1000, 500);
        this.gridTimer.subscribe(t => {
            this.checkChanges(t);
        });



    }

    groupRowInnerRendererFunc(params): any {
        var html = '';

        if (params.node.level == 0) {
            html += `<label style="color:#001a33"><b>${params.node.key}</b></label> (${params.node.childrenAfterGroup.length})`;
        }
        else {
            html += `<label style="color:#003366">${params.node.key}</label> (${params.node.childrenAfterGroup.length})`;
        }
        

        return html;
    }



   

    private rowPostCreate(params) {

     
        // if (this.gridColumnsLoaded == false) {
        //     this.gridColumnsLoaded = true;
        //     this.gridColumnsFormattedEvent.emit();
        // }



    }

  

    private changesMade($event): void {
        $event.data.__sysstatus = 1;
        this.changesOutstanding = true;
        this.inactivity = 0;
    }

    private checkChanges(t): void {
        this.inactivity = this.inactivity + 500;
        if (this.inactivity >= 1000 && this.changesOutstanding){
            // plus do the rest first as user might be carrying on changing stuff!
            this.changesOutstanding = false;// ensure we dont get extra saves from timer trigger

            this.gridOptions.api.forEachNode(node => {
                if (node.data && node.data.__sysstatus == 1) { 
                    this.saveRequestEvent.emit(node.data);
                    node.data.__sysstatus = 0;
                }
            });

            this.saveRequestAllDataEvent.emit(this.gridRows);

            this.changedRows = [];        
        }
    }

   

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {

        if (changes['externalRowSelection'] &&
            (changes['externalRowSelection'].currentValue != changes['externalRowSelection'].previousValue)) {
           

        }
        else {
            if (this.gridOptions && this.gridOptions.api) {
                //  set column properties
                this.columnDefs = this.setupColumns(this.columnDefs, this.gridCols);

                var dataFound: boolean = this.setupRowData();

                if(dataFound){
                    // set grid api properties
                    this.gridOptions.api.setRowData(this.gridRows);
                }                 
            }
        }



    }

   



    private setupRowData(): boolean {
        var internalCount = 0;
        var dataSet: boolean = true;

        if(this.gridRows  && this.gridRows != null && this.gridRows.length > 0){
            for (var gridRow of this.gridRows) {
             
                var sys: any = {};

                sys.status = 0; // 0=No change //1=changed

                gridRow.__sys = sys;
            }
            this.gridOptions.rowData = this.gridRows;
        }
        else{
            dataSet = false;
        }

        return dataSet;
        

    }


    private setupColumns(agColumnDef, txtColumnDef: GridColDef[]) : any[] {      
        var localCount: number = 0;

        var columnDef: any;

       

        // here we need to create the column defs dynamically from the provided gridColumnDefs
        
        for (var gridCol of txtColumnDef) {
            columnDef = {};

            columnDef.headerName = gridCol.headerName;

       
  
            columnDef.field = gridCol.field;
            if (gridCol.width) {
                columnDef.width = gridCol.width;
            }
           
            if (gridCol.rowGroupIndex != undefined) {
                columnDef.rowGroupIndex = gridCol.rowGroupIndex;
            }

            
    
            localCount += 1;

            columnDef.editable = gridCol.editable;

            columnDef.cellStyle = gridCol.cellStyle;
            columnDef.hide = gridCol.hide;
            columnDef.sort = gridCol.sort;
            columnDef.checkboxSelection = gridCol.checkboxSelection;
            if (columnDef.checkboxSelection) {
                columnDef.pinned = "left";
            }



            agColumnDef.push(columnDef);
        }

        return agColumnDef;
    }

    

    

    private onCellValueChanged($event) {
        // if ($event.newValue == $event.oldValue) return;

    
  

        // this.changesMade($event);

    }

  




    private onCellFocused($event) {

        // //If this cell is a dropdown then put the cell into edit mode.       
        // if ($event.column && $event.column.cellEditor && $event.column.cellEditor.name == "SimpleDDEditor") {
        //     this.gridOptions.api.startEditingCell({ colKey: $event.column.colId, rowIndex: $event.rowIndex });
        // }

        // var currentSortedRow: any = this.gridOptions.api.getModel().getRow($event.rowIndex);
        // var autoBlock: boolean = false;

        // /// the following section of code is requried when we want to adjust cell editing
        // /// dependant on a specific field and a situation that is dependant on the specific
        // /// row selected. It requires the Input() rowCellEditBlock to be passed in to
        // ///enable the code (see DMD-dataset-detail.component.ts and related)
        // if (currentSortedRow && this.rowCellEditBlock && this.rowCellEditBlock.length > 0) {
        //     // we want a row block, field will split (initially) into an array split by |
        //     // if we ever enhance to multiple fields then this would need a different splitter
        //     var blockStats: string[] = this.rowCellEditBlock.split("|");

        //     if (blockStats.length == 3) {
        //         var checkField: string = blockStats[0];
        //         var againstField: string = blockStats[1];
        //         var againstValue: string = blockStats[2];

        //         if ($event.column && $event.column.colId && $event.column.colId == checkField) {
        //             if (currentSortedRow.data && currentSortedRow.data[againstField] &&
        //                 currentSortedRow.data[againstField] != againstValue) {
        //                 $event.column.colDef.editable = false;
        //                 autoBlock = true;
        //             }
        //             else {
        //                 $event.column.colDef.editable = true;
        //             }
        //         }
        //     }

             
        // }

        // if ($event.column && $event.column.colDef && $event.column.colDef.field ) {
        //     if (this.createEditColumn.includes($event.column.colDef.field) && currentSortedRow && currentSortedRow.data){
        //         if(currentSortedRow.data.CrudStatus == 1 && autoBlock == false){
        //             // this is counted as a Created Row so is editable
        //             $event.column.colDef.editable = true;
        //         }else{
        //         $event.column.colDef.editable = false;
        //         }
        //     }
                
        // }

        


       

    }

   


  




    /**
     * This method will add a new row to the grid at the currently focused row. If there is no focus then the row will be added to the top of the grid. After adding the row, focus will be set to the provided (focusCol) column.
     * @param rowData The row to be added to the grid
     * @param focusCol The column to set focus to after the row has been added.
     */
    public addNewRow(rowData: any, focusCol: string) {
        //add the status property
        rowData.__sys = {
            status: 0
        }

        //Insert new row
        var focusedCell: GridCell = this.gridOptions.api.getFocusedCell();
        var insertAtRow: number = 0;
        if (focusedCell) {
            insertAtRow = focusedCell.rowIndex;
        }
        this.gridOptions.api.insertItemsAtIndex(insertAtRow, [rowData]);
        //this.gridOptions.rowData.push(rowData); //also need to add into main source. //NO the calling class handles the save this
        //inserts two records into the grid. This was done to prevent the 'add new row' hit 'expand window' and row disappears as the grid
        //row gets removed when refreshed. if this is re-added then a different correction for the original bug fix will need applying at the same time

        //position the grid so that the row is visible.
        this.gridOptions.api.setFocusedCell(insertAtRow, focusCol);
    }


    /**
    * This method will reset the column properties.
    * @param colDefs The new column definitions
    */
    public setColumnDefs(colDefs: GridColDef[]) {
        this.gridCols = colDefs;
        this.columnDefs = [];
        this.columnDefs = this.setupColumns(this.columnDefs, colDefs);
        this.gridOptions.api.setColumnDefs(this.columnDefs);
    }

}





export interface GridColDef {
    headerName: string;
    field: string;
    editable? :any;
    width?: number;
    editParams? :  {}; // expects a JSON object
    hide?: boolean;
    cellStyle?: any;// allows cell style for row to be overidden
    sortColumn?: any;// if set enables in grid sorting on this field.
    sort?: string;
    checkboxSelection?: boolean;
    rowGroupIndex?: number;
    validationMandatory?: boolean;
    validationUnique?: boolean;
    validationFormat?: RegExp;
    validationCreateEditOnly?: boolean;
    cellEditor?: any;
    children?: GridColDef[];
}
