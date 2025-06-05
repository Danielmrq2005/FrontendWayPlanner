import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaBilletesComponent } from './lista-billetes.component';

describe('ListaBilletesComponent', () => {
  let component: ListaBilletesComponent;
  let fixture: ComponentFixture<ListaBilletesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaBilletesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaBilletesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
