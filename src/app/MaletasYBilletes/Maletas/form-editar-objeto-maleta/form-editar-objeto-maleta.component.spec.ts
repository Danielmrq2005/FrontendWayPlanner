import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormEditarObjetoMaletaComponent } from './form-editar-objeto-maleta.component';

describe('FormEditarObjetoMaletaComponent', () => {
  let component: FormEditarObjetoMaletaComponent;
  let fixture: ComponentFixture<FormEditarObjetoMaletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormEditarObjetoMaletaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditarObjetoMaletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
