import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormMaletaComponent } from './form-maleta.component';

describe('FormMaletaComponent', () => {
  let component: FormMaletaComponent;
  let fixture: ComponentFixture<FormMaletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormMaletaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMaletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
