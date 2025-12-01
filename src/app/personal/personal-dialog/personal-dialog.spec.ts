import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDialog } from './personal-dialog';

describe('PersonalDialog', () => {
  let component: PersonalDialog;
  let fixture: ComponentFixture<PersonalDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
