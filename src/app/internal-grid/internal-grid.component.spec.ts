import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalGridComponent } from './internal-grid.component';

describe('InternalGridComponent', () => {
  let component: InternalGridComponent;
  let fixture: ComponentFixture<InternalGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
