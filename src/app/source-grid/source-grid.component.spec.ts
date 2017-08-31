import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceGridComponent } from './source-grid.component';

describe('SourceGridComponent', () => {
  let component: SourceGridComponent;
  let fixture: ComponentFixture<SourceGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
