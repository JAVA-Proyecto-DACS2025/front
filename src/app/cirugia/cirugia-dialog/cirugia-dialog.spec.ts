import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirugiaDialog } from './cirugia-dialog';

describe('CirugiaDialog', () => {
  let component: CirugiaDialog;
  let fixture: ComponentFixture<CirugiaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CirugiaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CirugiaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
