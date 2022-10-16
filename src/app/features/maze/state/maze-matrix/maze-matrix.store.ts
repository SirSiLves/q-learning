import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { MazeMatrixModel } from './maze-matrix.model';

export interface MazeMatrixState extends EntityState<MazeMatrixModel>, ActiveState {
}

export function createInitialState(): MazeMatrixState {
  return {} as MazeMatrixState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'maze-matrix', resettable: true})
export class MazeMatrixStore extends EntityStore<MazeMatrixState> {

  constructor() {
    super(createInitialState());
  }

}
