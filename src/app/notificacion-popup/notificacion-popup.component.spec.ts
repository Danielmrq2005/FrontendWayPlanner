import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificacionPopupComponent } from './notificacion-popup.component';

describe('NotificacionPopupComponent', () => {
  let component: NotificacionPopupComponent;
  let fixture: ComponentFixture<NotificacionPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NotificacionPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
