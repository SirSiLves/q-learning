import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, guid, Store, StoreConfig } from '@datorama/akita';
import { TttMatrixModel } from './ttt-matrix.model';
import { MazeMatrixModel } from '../../maze/state/maze-matrix/maze-matrix.model';

export interface TttMatrixState extends EntityState<TttMatrixModel>, ActiveState {
}

export function createInitialState(): TttMatrixState {
  return {} as TttMatrixState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'ttt-matrix', resettable: true})
export class TttMatrixStore extends EntityStore<TttMatrixState> {

  public static readonly initState = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  constructor() {
    super(createInitialState());

    const id = guid();
    this.upsert(id, {
      id,
      state: TttMatrixStore.initState,
      moves: 0,
      wins: 0,
      losses: 0,
      episode: 0
    });

    this.setActive(id);
  }

  createNewState(matrix: TttMatrixModel): void {
    const id = guid();

    this.upsert(id, {
      ...matrix,
      id,
    });

    this.setActive(id);
    this.setLoading(true);
  }

}
