import { MazeMatrixQuery } from './maze-matrix.query';
import { MazeMatrixStore } from './maze-matrix.store';

describe('MazeMatrixQuery', () => {
  let query: MazeMatrixQuery;

  beforeEach(() => {
    query = new MazeMatrixQuery(new MazeMatrixStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
