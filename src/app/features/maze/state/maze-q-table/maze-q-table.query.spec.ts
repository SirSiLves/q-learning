import { MazeQTableQuery } from './maze-q-table.query';
import { MazeQTableStore } from './maze-q-table.store';

describe('MazeQTableQuery', () => {
  let query: MazeQTableQuery;

  beforeEach(() => {
    query = new MazeQTableQuery(new MazeQTableStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
