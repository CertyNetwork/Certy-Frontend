import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkMintComponent } from './bulk-mint.component';

describe('BulkMintComponent', () => {
  let component: BulkMintComponent;
  let fixture: ComponentFixture<BulkMintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkMintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkMintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
