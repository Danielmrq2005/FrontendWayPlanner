import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaGruposBilletesComponent } from './lista-grupos-billetes.component';

describe('ListaGruposBilletesComponent', () => {
  let component: ListaGruposBilletesComponent;
  let fixture: ComponentFixture<ListaGruposBilletesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaGruposBilletesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaGruposBilletesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
