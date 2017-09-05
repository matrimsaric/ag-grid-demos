// angular
import {Component,OnInit, AfterContentInit, Input, Output, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { CommonModule } from "@angular/common";

// ag-grid
import { AgGridNg2, BaseComponentFactory } from 'ag-grid-angular/main';
import { GridOptions, ColDef, RangeSelection, GridCell, ICellRenderer,
    ICellRendererParams, ICellRendererFunc, ICellEditor, RowNode } from 'ag-grid/main';
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
    selector: 'base-grid',
    providers: [ BaseComponentFactory ],
    templateUrl: './base-grid.html',
})
export class BaseGrid implements OnChanges, OnInit {
    @Input() gridRows: any[]; // row data is passed as is to ag-grid

    // custom Grid properties
    // ======================
    @Input() gridCols: GridColDef[]; // this custom column definitions will be manipulated to what is required by ag-grid
    @Input() gridTitle: string = ""; // this is what will be dsiplayed as the title of the grid.
    @Input() showActionBar: boolean = false; // if true then the action bar will be displayed.
    @Input() enableRangeSelection: boolean = false;// if true then multi-select will be permitted if false or not provided then will not enable multi selection
    @Input() contextMenuChoice: number = 0; // this is a BIT flag field -- i.e use 1 to set select on own, 2 to select drill on own, 3 to select both select and drill
    @Input() enableDragDrop: boolean = false;
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
    @Output() internalDragDropOccurred: EventEmitter<any> = new EventEmitter();// when an internal drag drop adjusts rows then this event will fire with grid data 

    public columnDefs: any[] = []; // ag-grid column definitions
    public gridOptions: GridOptions; // ag-grid options
    public gridId: Date = new Date();


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

    private sourceGridId: Date;// holds dragged selection. If this 'drops' on the grid then an internal drag drop is in play
    private infiniteLoopBlock: boolean;// some sections of the grid misbehave badly
    private savedDragSourceData: any;// stores relevant key for internal drag/drop operations. Could by any type.


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

        if (params.eRow) {
            var selectionChangedCallback = function(){
                if(params.node.isSelected()){
                    params.eRow.draggable = true;

                    if (params.ePinnedLeftRow) {
                        params.ePinnedLeftRow.draggable = true;
                    }
                } else{
                    params.eRow.draggable = false;

                    if (params.ePinnedLeftRow) {
                        params.ePinnedLeftRow.draggable = false;
                    }
                }
            };
            params.node.addEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);

            // also need to remove the node from the list
            params.addRenderedRowListener('rowRemoved', function(){
                params.node.removeEventListener(RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
            });

            params.eRow.draggable = false;
        }
    }


    // ***************************** Drag Drop Methods ******************************
    public onDrop($event) {
        if (this.readOnly) return;

        
        if ($event && !this.infiniteLoopBlock) {
            if ($event.dataTransfer) {
                var evString = $event.dataTransfer.getData("text");
                if(evString || evString.length > 0){
                    return;// not an internal drag drop as we have transfer data!
                }

                this.infiniteLoopBlock = true;

                var targetRowId: number = 0;
                // get the destination row BEFORE we start adjusting rows
                // original first but post pin seems to be second structure.
                if ($event.target.offsetParent.attributes && $event.target.offsetParent.attributes["row-index"]) {
                    targetRowId = +$event.target.offsetParent.attributes["row-index"].value;
                }
                else {
                    if ($event.target.parentNode.parentNode.attributes && $event.target.parentNode.parentNode.attributes["row-index"]) {
                        targetRowId = +$event.target.parentNode.parentNode.attributes["row-index"].value;
                    }
                }

                var saveNodes = this.gridOptions.api.getSelectedNodes();


                // we do though need to remove from the source data
                // loop the seleted nodes to get the internal id
                for (var a = 0; a < saveNodes.length; a++) {
                    var localId: any = saveNodes[a].data["internalId"];

                    // now we have the id we can find the relevant row and collect the record
                    for (var b = 0; b < this.gridRows.length; b++) {
                        if (this.gridRows[b]["internalId"] == localId) {
                            this.gridRows.splice(b, 1);

                            // add in to the new location
                            this.gridRows.splice(targetRowId, 0, saveNodes[a].data);
                            break;
                        }

                    }
                }

                // clear set options so grid holds no 'memory'
                this.savedDragSourceData = null;
                this.gridOptions.api.clearRangeSelection();

                // not connected but in live shout out to owning component that grid
                // has changed and a save is required.
                this.internalDragDropOccurred.emit(this.gridRows);// force a save (if picked up by parent)
                
                

                this.infiniteLoopBlock = false;
            }
        }
        this.sourceGridId = null;

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
                if (this.enableDragDrop) {
                    // if internal drag drop is enabled then we
                    // need to populate our new internal id column with matching ids
                    gridRow.internalId = internalCount;

                    internalCount += 1;
                }

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
        console.log('setup columns called');   
        var localCount: number = 0;

        var columnDef: any;

        if (this.enableDragDrop) {
            //var columnDef: ColDef | ColGroupDef = {};
            
            columnDef = {};
            columnDef.editable = true;
            // if we are auto pinning certain columns set it here
            if (this.autoPinToColumn > -1 && localCount < this.autoPinToColumn) {
                columnDef.pinned = "left";
            }
            localCount += 1;
            columnDef.hide = false;
            columnDef.headerName = "";
            columnDef.__sysCheckbox = true;

            columnDef.width = 30;
            columnDef.checkboxSelection = true;

            this.columnDefs.push(columnDef);

            // always add id column in case we decide to allow internal drag drop
            columnDef = {
                editable: false,
                hide: true,
                field: "internalId"
            };
            agColumnDef.push(columnDef);
        }

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
