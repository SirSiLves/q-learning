import { MazeQTableStore } from './maze-q-table.store';

describe('MazeQTableStore', () => {
  let store: MazeQTableStore;

  beforeEach(() => {
    store = new MazeQTableStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
