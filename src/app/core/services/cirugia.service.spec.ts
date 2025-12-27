import { TestBed } from '@angular/core/testing';

import { CirugiaService } from './cirugia.service';

describe('CirugiaService', () => {
  let service: CirugiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CirugiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
