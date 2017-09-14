import { ICellEditor, ICellEditorParams, ICellRenderer, CellEditorFactory } from 'ag-grid/main';

export class CommentRenderer implements ICellRenderer {

    private params: any;
    htmlDiv: HTMLDivElement;

    init(params) {


        this.htmlDiv = document.createElement("div");
        this.htmlDiv.style.width = "100%";
        this.htmlDiv.style.height = "100%";
        this.htmlDiv.style.textAlign = "left";
        this.htmlDiv.style.verticalAlign = "middle";

        if(params.data.comment){
            this.htmlDiv.innerHTML = `<span class='glyphicon glyphicon-info-sign' style='color:green; float: 'left' aria-hidden='true'></span>`
        }
        else{
           this.htmlDiv.innerHTML = "";//params.value;
        }
    }

    getGui() {
        return this.htmlDiv;
    }

    refresh(params: any): boolean {
        this.params = params;

        return true;
    }

  
}