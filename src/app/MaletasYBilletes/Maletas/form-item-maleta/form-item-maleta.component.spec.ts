import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormItemMaletaComponent } from './form-item-maleta.component';

describe('FormItemMaletaComponent', () => {
  let component: FormItemMaletaComponent;
  let fixture: ComponentFixture<FormItemMaletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormItemMaletaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormItemMaletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
