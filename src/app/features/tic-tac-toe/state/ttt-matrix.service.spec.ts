import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TttMatrixService } from './ttt-matrix.service';
import { TttMatrixStore } from './ttt-matrix.store';

describe('TttMatrixService', () => {
  let tttMatrixService: TttMatrixService;
  let tttMatrixStore: TttMatrixStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TttMatrixService, TttMatrixStore],
      imports: [ HttpClientTestingModule ]
    });

    tttMatrixService = TestBed.inject(TttMatrixService);
    tttMatrixStore = TestBed.inject(TttMatrixStore);
  });

  it('should be created', () => {
    expect(tttMatrixService).toBeDefined();
  });

});
