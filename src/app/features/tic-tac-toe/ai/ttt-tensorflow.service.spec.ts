import { TestBed } from '@angular/core/testing';

import { TttTensorflowService } from './ttt-tensorflow.service';

describe('TttTensorflowService', () => {
  let service: TttTensorflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TttTensorflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
