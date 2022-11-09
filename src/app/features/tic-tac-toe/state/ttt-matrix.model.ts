export interface TttMatrixModel {
  id: string,
  state: number[][],
  wins: number,
  losses: number,
  moves: number,
  episode: number
}

export interface Position {
  x: number,
  y: number
}

export enum Action {
  UP_LEFT, UP, UP_RIGHT, MID_LEFT, MID, MID_RIGHT, DOWN_LEFT, DOWN, DOWN_RIGHT
}


export interface PlayStatus {
  winner?: number, // X = 1 or O = 2
  draw?: boolean
}
