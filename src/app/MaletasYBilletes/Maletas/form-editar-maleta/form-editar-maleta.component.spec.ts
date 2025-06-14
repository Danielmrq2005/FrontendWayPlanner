import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormEditarMaletaComponent } from './form-editar-maleta.component';

describe('FormEditarMaletaComponent', () => {
  let component: FormEditarMaletaComponent;
  let fixture: ComponentFixture<FormEditarMaletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormEditarMaletaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditarMaletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
