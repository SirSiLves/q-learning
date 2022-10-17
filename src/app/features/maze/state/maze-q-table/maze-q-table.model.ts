import { Elements } from '../maze-matrix/maze-matrix.model';

export interface MazeQTableModel {
  values: number[][]
}

export interface Reward {
  value: number,
  done: boolean
  newState: Elements[][]
}

