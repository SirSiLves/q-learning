import { Injectable } from '@angular/core';
import { MazeMatrixStore } from './maze-matrix.store';

@Injectable({ providedIn: 'root' })
export class MazeMatrixService {

  constructor(
    private mazeMatrixStore: MazeMatrixStore
  ) {
  }


}
