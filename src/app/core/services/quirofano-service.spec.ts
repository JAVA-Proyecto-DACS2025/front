import { TestBed } from '@angular/core/testing';

import { QuirofanoService } from './quirofano-service';

describe('QuirofanoService', () => {
  let service: QuirofanoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuirofanoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
