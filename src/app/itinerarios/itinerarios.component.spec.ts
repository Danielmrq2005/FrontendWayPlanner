import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItinerariosComponent } from './itinerarios.component';

describe('ItinerariosComponent', () => {
  let component: ItinerariosComponent;
  let fixture: ComponentFixture<ItinerariosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItinerariosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItinerariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
