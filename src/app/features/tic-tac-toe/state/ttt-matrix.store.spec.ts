import { TttMatrixStore } from './ttt-matrix.store';

describe('TttMatrixStore', () => {
  let store: TttMatrixStore;

  beforeEach(() => {
    store = new TttMatrixStore();
  });

  it('should create an instance', () => {
    expect(store).toBeTruthy();
  });

});
