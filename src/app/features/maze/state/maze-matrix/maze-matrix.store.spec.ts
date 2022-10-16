import { MazeMatrixStore } from './maze-matrix.store';

describe('MazeMatrixStore', () => {
  let store: MazeMatrixStore;

  beforeEach(() => {
    store = new MazeMatrixStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
