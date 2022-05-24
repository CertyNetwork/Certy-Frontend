import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearLoginComponent } from './near-login.component';

describe('NearLoginComponent', () => {
  let component: NearLoginComponent;
  let fixture: ComponentFixture<NearLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NearLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NearLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
