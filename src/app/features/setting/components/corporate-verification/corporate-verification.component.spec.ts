import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateVerificationComponent } from './corporate-verification.component';

describe('CorporateVerificationComponent', () => {
  let component: CorporateVerificationComponent;
  let fixture: ComponentFixture<CorporateVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
