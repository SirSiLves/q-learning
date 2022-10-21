import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TttMatrixStore, TttMatrixState } from './ttt-matrix.store';

@Injectable({ providedIn: 'root' })
export class TttMatrixQuery extends QueryEntity<TttMatrixState> {

  activeTTT$ = this.selectActive();

  constructor(protected override store: TttMatrixStore) {
    super(store);
  }

}
