import { Injectable } from '@angular/core';
import { TttMatrixStore } from './ttt-matrix.store';
import { Action, PlayStatus, TttMatrixModel } from './ttt-matrix.model';
import { TttRandomService } from '../ai/ttt-random.service';
import { TttTensorflowService } from '../ai/ttt-tensorflow.service';

@Injectable({providedIn: 'root'})
export class TttMatrixService {

  constructor(
    private tttMatrixStore: TttMatrixStore,
    private tttRandomService: TttRandomService,
    private tttTensorflowService: TttTensorflowService
  ) {
  }

  static copyModel(matrix: TttMatrixModel): TttMatrixModel {
    const len = matrix.state.length, copiedState = new Array(len);
    for (let i = 0; i < len; ++i) copiedState[i] = matrix.state[i].slice(0);

    return {...matrix, state: copiedState};
  }

  static copyState(state: number[][]): number[][] {
    const len = state.length, copiedState = new Array(len);
    for (let i = 0; i < len; ++i) copiedState[i] = state[i].slice(0);

    return copiedState;
  }

  static getActions(): Action[] {
    return [
      Action.UP_LEFT, Action.UP, Action.UP_RIGHT,
      Action.MID_LEFT, Action.MID, Action.MID_RIGHT,
      Action.DOWN_LEFT, Action.DOWN, Action.DOWN_RIGHT
    ];
  }

  updatePlay(tttMatrixModel: TttMatrixModel, yIndex: number, xIndex: number): void {
    const isPlaying = TttMatrixService.getIsPlaying(tttMatrixModel.state); // X = 1 or O = 2
    let copyMatrix = TttMatrixService.copyModel(tttMatrixModel);

    copyMatrix.state[yIndex][xIndex] = isPlaying;

    this.tttMatrixStore.createNewState({
      ...copyMatrix
    });

    if (!TttMatrixService.winnerOrDraw(copyMatrix.state)) {
      this.makeRandom(copyMatrix);
    }


    this.tttMatrixStore.setLoading(false);
  }

  static getIsPlaying(state: number[][]): number {
    let countX = 0;
    let countO = 0;

    for (let y = 0; y < state.length; y++) {
      for (let x = 0; x < state[y].length; x++) {
        if (state[y][x] === 1) {
          countX++;
        } else if (state[y][x] === 2) {
          countO++;
        }
      }
    }

    if (countX > countO) return 2;
    else return 1;
  }

  static winnerOrDraw(matrix: number[][] | undefined): PlayStatus | undefined {
    if (!matrix) return undefined;

    // win x
    // horizontal
    if (matrix[0][0] === 1 && matrix[0][1] === 1 && matrix[0][2] === 1) {
      return {winner: 1};
    }
    if (matrix[1][0] === 1 && matrix[1][1] === 1 && matrix[1][2] === 1) {
      return {winner: 1};
    }
    if (matrix[2][0] === 1 && matrix[2][1] === 1 && matrix[2][2] === 1) {
      return {winner: 1};
    }
    // vertical
    if (matrix[0][0] === 1 && matrix[1][0] === 1 && matrix[2][0] === 1) {
      return {winner: 1};
    }
    if (matrix[0][1] === 1 && matrix[1][1] === 1 && matrix[2][1] === 1) {
      return {winner: 1};
    }
    if (matrix[0][2] === 1 && matrix[1][2] === 1 && matrix[2][2] === 1) {
      return {winner: 1};
    }
    // diagonal
    if (matrix[0][0] === 1 && matrix[1][1] === 1 && matrix[2][2] === 1) {
      return {winner: 1};
    }
    if (matrix[0][2] === 1 && matrix[1][1] === 1 && matrix[2][0] === 1) {
      return {winner: 1};
    }

    // win o
    // horizontal
    if (matrix[0][0] === 2 && matrix[0][1] === 2 && matrix[0][2] === 2) {
      return {winner: 2};
    }
    if (matrix[1][0] === 2 && matrix[1][1] === 2 && matrix[1][2] === 2) {
      return {winner: 2};
    }
    if (matrix[2][0] === 2 && matrix[2][1] === 2 && matrix[2][2] === 2) {
      return {winner: 2};
    }
    // vertical
    if (matrix[0][0] === 2 && matrix[1][0] === 2 && matrix[2][0] === 2) {
      return {winner: 2};
    }
    if (matrix[0][1] === 2 && matrix[1][1] === 2 && matrix[2][1] === 2) {
      return {winner: 2};
    }
    if (matrix[0][2] === 2 && matrix[1][2] === 2 && matrix[2][2] === 2) {
      return {winner: 2};
    }
    // diagonal
    if (matrix[0][0] === 2 && matrix[1][1] === 2 && matrix[2][2] === 2) {
      return {winner: 2};
    }
    if (matrix[0][2] === 2 && matrix[1][1] === 2 && matrix[2][0] === 2) {
      return {winner: 2};
    }

    // draw
    let count = 0;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] !== 0) count++;
      }
    }

    if (count === 9) return {draw: true};

    return undefined;
  }

  reset(tttMatrixModel: TttMatrixModel): TttMatrixModel {
    let copyMatrix = {
      ...TttMatrixService.copyModel(tttMatrixModel),
      state: TttMatrixStore.initState
    };

    this.tttMatrixStore.createNewState(copyMatrix);
    this.tttMatrixStore.setLoading(false);

    return copyMatrix;
  }

  makeRandom(tttMatrixModel: TttMatrixModel): void {
    this.tttTensorflowService.start(tttMatrixModel);

    const randomMatrix = this.tttRandomService.random(tttMatrixModel);
    this.tttMatrixStore.createNewState({
      ...randomMatrix
    });

    this.tttMatrixStore.setLoading(false);
  }

  static tryActionWithReward(state: number[][], isPlaying: number, action: Action): number {
    switch (action) {
      case Action.UP_LEFT: {
        if (state[0][0] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.UP: {
        if (state[0][1] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.UP_RIGHT: {
        if (state[0][2] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.MID_LEFT: {
        if (state[1][0] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.MID: {
        if (state[1][1] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.MID_RIGHT: {
        if (state[1][2] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.DOWN_LEFT: {
        if (state[2][0] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.DOWN: {
        if (state[2][1] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
      case Action.DOWN_RIGHT: {
        if (state[2][2] === 0) return this.checkWinWithReward(state, isPlaying);
        else return -1;
      }
    }

    throw new Error("Action not found for value:" + state);
  }

  private static checkWinWithReward(state: number[][], isPlaying: number): number {
    const playStatus: PlayStatus | undefined = TttMatrixService.winnerOrDraw(state);

    if (!playStatus) return 0; // still on going
    if (playStatus.winner === isPlaying) return 10; // it's a win;
    else return -10; // it's a loss
  }
}
