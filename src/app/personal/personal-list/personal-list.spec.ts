import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalList } from './personal-list';

describe('PersonalList', () => {
  let component: PersonalList;
  let fixture: ComponentFixture<PersonalList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
