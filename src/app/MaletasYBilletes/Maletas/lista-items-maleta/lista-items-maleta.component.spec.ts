import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaItemsMaletaComponent } from './lista-items-maleta.component';

describe('ListaItemsMaletaComponent', () => {
  let component: ListaItemsMaletaComponent;
  let fixture: ComponentFixture<ListaItemsMaletaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaItemsMaletaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaItemsMaletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
