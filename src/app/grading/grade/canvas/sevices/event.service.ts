import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({ providedIn: 'root' })

export class DrawingStoreEvent {
    _questionChanged$ = new Subject<boolean>();
    _pageSelectEvent$ = new Subject<void>();
    _clearCurrentPageEvent$ = new Subject<void>();
    _backgroundChange$ = new BehaviorSubject<string | null>(null);
    _selectMeasurementTool$ = new Subject<string | null>();
    _removeMeasurementTool$ = new BehaviorSubject<string | null>(null);
    _layoutSub$ = new Subject<void>();
}