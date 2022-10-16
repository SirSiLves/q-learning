import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, guid, StoreConfig } from '@datorama/akita';
import { Elements, MazeMatrixModel } from './maze-matrix.model';

export interface MazeMatrixState extends EntityState<MazeMatrixModel>, ActiveState {
}

export function createInitialState(): MazeMatrixState {
  return {} as MazeMatrixState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'maze-matrix', resettable: true})
export class MazeMatrixStore extends EntityStore<MazeMatrixState> {

  public static readonly initState = [
    [Elements.EMPTY, Elements.EMPTY, Elements.EMPTY, Elements.GOAL],
    [Elements.EMPTY, Elements.EMPTY, Elements.EMPTY, Elements.EMPTY],
    [Elements.EMPTY, Elements.BLOCK, Elements.HOLE, Elements.EMPTY],
    [Elements.PLAYER, Elements.EMPTY, Elements.EMPTY, Elements.EMPTY],
  ];

  constructor() {
    super(createInitialState());

    const id = guid();
    this.upsert(id, {
      id,
      state: MazeMatrixStore.initState,
      moves: 0,
      wins: 0,
      losses: 0,
      episode: 0
    });

    this.setActive(id);
  }

  createNewState(matrix: MazeMatrixModel): void {
    const id = guid();

    this.upsert(id, {
      ...matrix,
      id,
    });

    this.setActive(id);
    this.setLoading(true);
  }
}
