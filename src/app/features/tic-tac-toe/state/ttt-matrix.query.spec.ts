import { TttMatrixQuery } from './ttt-matrix.query';
import { TttMatrixStore } from './ttt-matrix.store';

describe('TttMatrixQuery', () => {
  let query: TttMatrixQuery;

  beforeEach(() => {
    query = new TttMatrixQuery(new TttMatrixStore);
  });

  it('should create an instance', () => {
    expect(query).toBeTruthy();
  });

});
