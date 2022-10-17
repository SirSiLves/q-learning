import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MazeQTableService } from './maze-q-table.service';
import { MazeQTableStore } from './maze-q-table.store';

describe('MazeQTableService', () => {
  let mazeQTableService: MazeQTableService;
  let mazeQTableStore: MazeQTableStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MazeQTableService, MazeQTableStore],
      imports: [ HttpClientTestingModule ]
    });

    mazeQTableService = TestBed.inject(MazeQTableService);
    mazeQTableStore = TestBed.inject(MazeQTableStore);
  });

  it('should be created', () => {
    expect(mazeQTableService).toBeDefined();
  });

});
