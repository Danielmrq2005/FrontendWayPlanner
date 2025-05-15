import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetallesViajeComponent } from './detalles-viaje.component';

describe('DetallesViajeComponent', () => {
  let component: DetallesViajeComponent;
  let fixture: ComponentFixture<DetallesViajeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DetallesViajeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
