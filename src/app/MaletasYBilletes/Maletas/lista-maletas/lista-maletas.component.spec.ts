import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListaMaletasComponent } from './lista-maletas.component';

describe('ListaMaletasComponent', () => {
  let component: ListaMaletasComponent;
  let fixture: ComponentFixture<ListaMaletasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListaMaletasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMaletasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
