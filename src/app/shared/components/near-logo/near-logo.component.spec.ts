import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearLogoComponent } from './near-logo.component';

describe('NearLogoComponent', () => {
  let component: NearLogoComponent;
  let fixture: ComponentFixture<NearLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearLogoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
