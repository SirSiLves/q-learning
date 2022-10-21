import { TestBed } from '@angular/core/testing';

import { TttRandomService } from './ttt-random.service';

describe('TttRandomService', () => {
  let service: TttRandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TttRandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
