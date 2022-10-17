import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { MazeQTableModel } from './maze-q-table.model';
import { MazeMatrixStore } from '../maze-matrix/maze-matrix.store';
import { MazeMatrixService } from '../maze-matrix/maze-matrix.service';

export interface MazeQTableState {
  state: MazeQTableModel;
}

export function createInitialState(): MazeQTableState {
  return {} as MazeQTableState;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'maze-q-table'})
export class MazeQTableStore extends Store<MazeQTableState> {

  constructor() {
    super(createInitialState());

    this.init();
  }

  init(): void {
    const matrixSize = MazeMatrixStore.initState.length * MazeMatrixStore.initState[0].length;
    const actionSize = MazeMatrixService.getActions().length;

    let qTable: number[][] = [];
    let i = 0;
    for (let y = 0; y < matrixSize; y++) {
      qTable.push([]);
      for (let x = 0; x < actionSize; x++) {
        qTable[y].push(0);
        i++;
      }
    }

    this.update({
      state: {values: qTable}
    });
  }

}
