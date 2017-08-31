
export enum DRAG_DROP_SOURCE {
    NONE = 0,
    CAR_SOURCE = 1,
    CAR_DESTINATION = 2
}


export class DragDropObject{
    public windowId: string = "";
    public windowSource: DRAG_DROP_SOURCE = DRAG_DROP_SOURCE.NONE;
    public dragData: any;
    public spareDragData: any;
}