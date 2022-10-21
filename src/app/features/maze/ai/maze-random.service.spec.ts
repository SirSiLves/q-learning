import { TestBed } from '@angular/core/testing';

import { MazeRandomService } from './random.service';

describe('RandomService', () => {
  let service: MazeRandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MazeRandomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
