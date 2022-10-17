import { Injectable } from '@angular/core';
import { MazeMatrixStore } from './maze-matrix.store';
import { Action, Elements, MazeMatrixModel, Position } from './maze-matrix.model';
import { RandomService } from '../../ai/random.service';
import { QLearningService } from '../../ai/q-learning.service';
import { MazeQTableQuery } from '../maze-q-table/maze-q-table.query';


@Injectable({providedIn: 'root'})
export class MazeMatrixService {


  constructor(
    private mazeMatrixStore: MazeMatrixStore,
    private randomService: RandomService,
    private qLearningService: QLearningService,
    private mazeQTableQuery: MazeQTableQuery
  ) {
  }

  static playerPosition(state: Elements[][]): Position {
    for (let y = 0; y < state.length; y++) {
      for (let x = 0; x < state.length; x++) {
        if (state[y][x] === Elements.PLAYER) return {x, y};
      }
    }

    throw new Error("Could not find player position in: " + state);
  }

  static copyModel(matrix: MazeMatrixModel): MazeMatrixModel {
    const len = matrix.state.length, copiedState = new Array(len);
    for (let i = 0; i < len; ++i) copiedState[i] = matrix.state[i].slice(0);

    return {...matrix, state: copiedState};
  }

  static copyState(state: Elements[][]): Elements[][] {
    const len = state.length, copiedState = new Array(len);
    for (let i = 0; i < len; ++i) copiedState[i] = state[i].slice(0);

    return copiedState;
  }

  static getActions(): Action[] {
    return [
      Action.UP, Action.RIGHT, Action.DOWN, Action.LEFT
    ];
  }

  random(episodes: number, startMatrix: MazeMatrixModel): void {
    this.mazeMatrixStore.setLoading(true);
    this.randomService.runMaze(startMatrix, episodes);
  }

  qLearning(episodes: number, startMatrix: MazeMatrixModel): void {
    this.mazeMatrixStore.setLoading(true);
    this.qLearningService.runMaze(startMatrix, episodes, this.mazeQTableQuery.getValue().state.values);
  }


}
