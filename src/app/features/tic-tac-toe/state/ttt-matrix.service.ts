import { Injectable } from '@angular/core';
import { TttMatrixStore } from './ttt-matrix.store';
import { Action, RewardState, PlayStatus, TttMatrixModel } from './ttt-matrix.model';
import { TttRandomService } from '../ai/ttt-random.service';
import { TttTensorflowService } from '../ai/ttt-tensorflow.service';

@Injectable({providedIn: 'root'})
export class TttMatrixService {

  public static readonly INVALID_REWARD = -100;

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
      this.makeWithPredict(copyMatrix);
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
    const randomMatrix = this.tttRandomService.random(tttMatrixModel);
    this.tttMatrixStore.createNewState({
      ...randomMatrix
    });

    this.tttMatrixStore.setLoading(false);
  }

  makeWithPredict(tttMatrixModel: TttMatrixModel): void {
    const isPlaying = TttMatrixService.getIsPlaying(tttMatrixModel.state); // X = 1 or O = 2
    const action = this.tttTensorflowService.predict(tttMatrixModel.state);

    let copyMatrix = TttMatrixService.copyModel(tttMatrixModel);
    let newState = TttMatrixService.doAction(copyMatrix.state, action, isPlaying);

    this.tttMatrixStore.createNewState({
      ...copyMatrix,
      state: newState
    });

    this.tttMatrixStore.setLoading(false);
  }

  static getAvailableActions(state: number[][]): number[] {
    const possibleActions = [];
    for (let i = 0; i < TttMatrixService.getActions().length; i++) {
      const action = TttMatrixService.getActions()[i];

      switch (action) {
        case Action.UP_LEFT: {
          if (state[0][0] === 0) possibleActions.push(action);
          break;
        }
        case Action.UP: {
          if (state[0][1] === 0) possibleActions.push(action);
          break;
        }
        case Action.UP_RIGHT: {
          if (state[0][2] === 0) possibleActions.push(action);
          break;
        }
        case Action.MID_LEFT: {
          if (state[1][0] === 0) possibleActions.push(action);
          break;
        }
        case Action.MID: {
          if (state[1][1] === 0) possibleActions.push(action);
          break;
        }
        case Action.MID_RIGHT: {
          if (state[1][2] === 0) possibleActions.push(action);
          break;
        }
        case Action.DOWN_LEFT: {
          if (state[2][0] === 0) possibleActions.push(action);
          break;
        }
        case Action.DOWN: {
          if (state[2][1] === 0) possibleActions.push(action);
          break;
        }
        case Action.DOWN_RIGHT: {
          if (state[2][2] === 0) possibleActions.push(action);
          break;
        }
      }
    }

    return possibleActions;
  }

  static getActionReward(state: number[][], isPlaying: number, action: Action): number {
    const stateAfterAction = TttMatrixService.doAction(state, action, isPlaying);

    const end = TttMatrixService.winnerOrDraw(stateAfterAction);
    if (end) {
      if (end.draw) return 0;
      if (end.winner === isPlaying) return 10; // it's a win;
      return -10; // it's a loss
    }

    // game is still on going
    return 0;
  }

  train(episodes: number): void {
    this.tttTensorflowService.train(TttMatrixStore.initState, episodes, 1); // isPlaying 1 = X & 2 = O
  }

  static doAction(state: number[][], chosenAction: Action, isPlaying: number): number[][] {
    const newState = TttMatrixService.copyState(state);

    if (chosenAction === Action.UP_LEFT) newState[0][0] = isPlaying;
    else if (chosenAction === Action.UP) newState[0][1] = isPlaying;
    else if (chosenAction === Action.UP_RIGHT) newState[0][2] = isPlaying;
    else if (chosenAction === Action.MID_LEFT) newState[1][0] = isPlaying;
    else if (chosenAction === Action.MID) newState[1][1] = isPlaying;
    else if (chosenAction === Action.MID_RIGHT) newState[1][2] = isPlaying;
    else if (chosenAction === Action.DOWN_LEFT) newState[2][0] = isPlaying;
    else if (chosenAction === Action.DOWN) newState[2][1] = isPlaying;
    else if (chosenAction === Action.DOWN_RIGHT) newState[2][2] = isPlaying;
    else throw new Error("Could not find chosen action" + chosenAction);

    return newState;
  }

  uploadDQN(model: File, weights: File): void {
    this.tttTensorflowService.loadModel(model, weights);
  }

  downloadDQN(): void {
    this.tttTensorflowService.downloadDQNModel();
  }

  static executeActionWithReward(state: number[][], isPlaying: number, action: Action): RewardState {
    const stateAfterAction = TttMatrixService.doAction(state, action, isPlaying);
    const aiWinOrDraw: PlayStatus | undefined = TttMatrixService.winnerOrDraw(stateAfterAction);
    if (aiWinOrDraw) {
      const rewardState = this.getReward(aiWinOrDraw, stateAfterAction, isPlaying);
      return {
        ...rewardState,
        winnerOrDraw: aiWinOrDraw
      };
    }

    const stateAfterOpponent: number[][] = TttRandomService.makeRandomAction(stateAfterAction, isPlaying === 1 ? 2 : 1);
    const opponentWinOrDraw: PlayStatus | undefined = TttMatrixService.winnerOrDraw(stateAfterOpponent);
    if (opponentWinOrDraw) {
      const rewardState = this.getReward(opponentWinOrDraw, stateAfterOpponent, isPlaying === 1 ? 2 : 1);
      rewardState.reward = opponentWinOrDraw.winner !== isPlaying ? rewardState.reward * -1 : rewardState.reward; // set negative score because opponent has won
      return {
        ...rewardState,
        winnerOrDraw: opponentWinOrDraw
      };
    }

    return {
      state: stateAfterOpponent,
      reward: 0,
      winnerOrDraw: undefined
    }; // game is still on going
  }

  private static getReward(end: PlayStatus, stateAfterAction: number[][], isPlaying: number): RewardState {
    if (end.draw) return {
      state: stateAfterAction,
      reward: 5
    } // it's a draw
    if (end.winner === isPlaying) return {
      state: stateAfterAction,
      reward: 10
    } // it's a win;
    else return {
      state: stateAfterAction,
      reward: -10
    }; // it's a loss
  }

  test(episodes: number): void {
    this.tttTensorflowService.test(TttMatrixStore.initState, episodes, 1);
  }
}
