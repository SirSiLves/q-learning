import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MazeMatrixService } from './maze-matrix.service';
import { MazeMatrixStore } from './maze-matrix.store';

describe('MazeMatrixService', () => {
  let mazeMatrixService: MazeMatrixService;
  let mazeMatrixStore: MazeMatrixStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MazeMatrixService, MazeMatrixStore],
      imports: [ HttpClientTestingModule ]
    });

    mazeMatrixService = TestBed.inject(MazeMatrixService);
    mazeMatrixStore = TestBed.inject(MazeMatrixStore);
  });

  it('should be created', () => {
    expect(mazeMatrixService).toBeDefined();
  });

});
