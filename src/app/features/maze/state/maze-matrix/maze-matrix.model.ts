export interface MazeMatrixModel {
  id: string,
  state: Elements[][],
  wins: number,
  losses: number,
  moves: number,
  episode: number
}

export enum Elements {
  EMPTY, PLAYER, BLOCK, HOLE, GOAL
}


export interface Position {
  x: number,
  y: number
}

export enum Action {
  UP, RIGHT, DOWN, LEFT
}
