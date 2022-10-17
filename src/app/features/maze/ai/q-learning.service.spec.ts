import { TestBed } from '@angular/core/testing';

import { QLearningService } from './q-learning.service';

describe('QLearningService', () => {
  let service: QLearningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QLearningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
