import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormEditarBilleteComponent } from './form-editar-billete.component';

describe('FormEditarBilleteComponent', () => {
  let component: FormEditarBilleteComponent;
  let fixture: ComponentFixture<FormEditarBilleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormEditarBilleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditarBilleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
