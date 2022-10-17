import { Injectable } from '@angular/core';
import { MazeQTableStore } from './maze-q-table.store';
import { MazeQTableQuery } from './maze-q-table.query';

@Injectable({providedIn: 'root'})
export class MazeQTableService {

  constructor(
    private mazeQTableStore: MazeQTableStore,
    private mazeQTableQuery: MazeQTableQuery
  ) {
  }


}
