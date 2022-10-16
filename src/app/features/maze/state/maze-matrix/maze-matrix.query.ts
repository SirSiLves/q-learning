import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MazeMatrixStore, MazeMatrixState } from './maze-matrix.store';

@Injectable({ providedIn: 'root' })
export class MazeMatrixQuery extends QueryEntity<MazeMatrixState> {

  activeMaze$ = this.selectActive();

  constructor(
    protected override store: MazeMatrixStore
  ) {
    super(store);
  }

}
