import { TestBed } from '@angular/core/testing';

import { MazeQLearningService } from './q-learning.service';

describe('QLearningService', () => {
  let service: MazeQLearningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MazeQLearningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
