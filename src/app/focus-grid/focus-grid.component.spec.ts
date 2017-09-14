import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusGridComponent } from './focus-grid.component';

describe('FocusGridComponent', () => {
  let component: FocusGridComponent;
  let fixture: ComponentFixture<FocusGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FocusGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FocusGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
