import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderMaletaBilleteComponent } from './header-maleta-billete.component';

describe('HeaderMaletaBilleteComponent', () => {
  let component: HeaderMaletaBilleteComponent;
  let fixture: ComponentFixture<HeaderMaletaBilleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeaderMaletaBilleteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMaletaBilleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
