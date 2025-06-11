import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormBilleteComponent } from './form-billete.component';

describe('FormBilleteComponent', () => {
  let component: FormBilleteComponent;
  let fixture: ComponentFixture<FormBilleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormBilleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormBilleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
