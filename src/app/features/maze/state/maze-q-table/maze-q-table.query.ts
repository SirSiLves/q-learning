import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { MazeQTableStore, MazeQTableState } from './maze-q-table.store';



@Injectable({ providedIn: 'root' })
export class MazeQTableQuery extends Query<MazeQTableState> {

  constructor(protected override store: MazeQTableStore) {
    super(store);
  }

}
