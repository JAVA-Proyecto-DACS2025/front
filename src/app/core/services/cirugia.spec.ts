import { TestBed } from '@angular/core/testing';

import { Cirugia } from './cirugia';

describe('Cirugia', () => {
  let service: Cirugia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cirugia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
