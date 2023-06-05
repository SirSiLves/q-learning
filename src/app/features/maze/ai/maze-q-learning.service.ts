import { Injectable } from '@angular/core';
import { Action, Elements, MazeMatrixModel, Position } from '../state/maze-matrix/maze-matrix.model';
import { MazeQTableService } from '../state/maze-q-table/maze-q-table.service';
import { MazeMatrixStore } from '../state/maze-matrix/maze-matrix.store';
import { MazeQTableQuery } from '../state/maze-q-table/maze-q-table.query';
import { MazeMatrixService } from '../state/maze-matrix/maze-matrix.service';
import { Reward } from '../state/maze-q-table/maze-q-table.model';
import { MazeQTableStore } from '../state/maze-q-table/maze-q-table.store';
import { MazeRandomService } from './maze-random.service';

@Injectable({
  providedIn: 'root'
})
export class MazeQLearningService {

  private visualize: boolean = true;

  // q-learning hyperparameters
  private alpha = 0.5; // a-learning rate between 0 and 1
  private gamma = 0.9; // y-discount factor between 0 and 1
  private epsilon = 0.9; // exploitation vs exploration between 0 and 1
  private epsilonDecay = 0.001; // go slightly for more exploitation instead of exploration
  private epsilonDecrease = true; // go slightly for more exploitation instead of exploration

  // Rewards
  private rBlock = -0.01;
  private rStay = -0.01;
  private rHole = -1;
  private rGoal = 1;

  constructor(
    private mazeQTableQuery: MazeQTableQuery,
    private mazeQTableService: MazeQTableService,
    private mazeQTableStore: MazeQTableStore,
    private mazeMatrixStore: MazeMatrixStore
  ) {
  }

  runMaze(startMatrix: MazeMatrixModel, episodes: number, qTable: number[][], train: boolean, visualizeTimeout: number): void {
    let state = MazeMatrixService.copyModel(startMatrix).state;

    // exploitation vs exploration, if random is smaller than epsilon go for exploration
    const random = MazeRandomService.generateRandomNumber(0, 10) / 10;
    const action: Action = random < this.epsilon ? this.getRandomAction() : this.getQValueMaxOnAction(qTable, state);

    // get reward result in chosen action
    const reward: Reward = this.executeAndGetRewards(state, action);

    // update Q(s,a)
    if (train) {
      const qValueNEW = this.calculateQValue(qTable, state, action, reward.value, reward.newState);
      this.updateQTable(qTable, state, action, qValueNEW);
    }

    // call recursive
    if (episodes > 0) {
      setTimeout(() => {
        const newStartMatrix: MazeMatrixModel = {...startMatrix, state: reward.newState};

        // still searching through the maze
        if (!reward.done) {
          newStartMatrix.moves++;
          if (this.visualize) this.mazeMatrixStore.createNewState(newStartMatrix);
          this.runMaze(newStartMatrix, episodes, qTable, train, visualizeTimeout);
        }
        // new episode
        else {
          if ([this.rHole].includes(reward.value)) {
            newStartMatrix.losses++;
          } else if ([this.rGoal].includes(reward.value)) {
            newStartMatrix.wins++;
          }
          // reset
          const resetStartMatrix = {
            ...MazeMatrixService.copyModel(newStartMatrix),
            state: MazeMatrixStore.initState,
            episode: newStartMatrix.episode + 1
          }

          if (this.epsilonDecrease) this.epsilon = Math.max(this.epsilon - this.epsilonDecay, 0);

          if (this.visualize) this.mazeMatrixStore.createNewState(resetStartMatrix);
          this.runMaze(resetStartMatrix, episodes - 1, qTable, train, visualizeTimeout);
        }
      }, this.visualize ? visualizeTimeout : 0)
    } else {
      this.mazeMatrixStore.createNewState(startMatrix);
      this.mazeMatrixStore.setLoading(false);
    }
  }

  private executeAndGetRewards(state: Elements[][], chosenAction: Action): Reward {
    let position: Position = MazeMatrixService.playerPosition(state);
    let newState = MazeMatrixService.copyState(state);

    switch (chosenAction) {
      case Action.UP: {
        if (0 < position.y) {
          switch (state[position.y - 1][position.x]) {
            case Elements.BLOCK:
              return {value: this.rBlock, done: false, newState: state};
            case Elements.HOLE:
              return {value: this.rHole, done: true, newState: state};
            case Elements.PLAYER:
              console.error(state, position)
              throw new Error('Something went wrong with action ' + Action.UP + ' on position');
            case Elements.GOAL:
              return {value: this.rGoal, done: true, newState: state};
            default: {
              newState[position.y - 1][position.x] = Elements.PLAYER;
              newState[position.y][position.x] = Elements.EMPTY;
              return {value: this.rStay, done: false, newState};
            }
          }
        }
        break;
      }
      case Action.RIGHT: {
        if (position.x < state[position.y].length - 1) {
          switch (state[position.y][position.x + 1]) {
            case Elements.BLOCK:
              return {value: this.rBlock, done: false, newState: state};
            case Elements.HOLE:
              return {value: 0, done: true, newState: state};
            case Elements.PLAYER:
              console.error(state, position)
              throw new Error('Something went wrong with action ' + Action.RIGHT + ' on position');
            case Elements.GOAL:
              return {value: 1, done: true, newState: state};
            default: {
              newState[position.y][position.x + 1] = Elements.PLAYER;
              newState[position.y][position.x] = Elements.EMPTY;
              return {value: 0, done: false, newState};
            }
          }
        }
        break;
      }
      case Action.DOWN: {
        if (position.y < state.length - 1) {
          switch (state[position.y + 1][position.x]) {
            case Elements.BLOCK:
              return {value: 0, done: false, newState: state};
            case Elements.HOLE:
              return {value: 0, done: true, newState: state};
            case Elements.PLAYER:
              console.error(state, position)
              throw new Error('Something went wrong with action ' + Action.DOWN + ' on position');
            case Elements.GOAL:
              return {value: 1, done: true, newState: state};
            default: {
              newState[position.y + 1][position.x] = Elements.PLAYER;
              newState[position.y][position.x] = Elements.EMPTY;
              return {value: 0, done: false, newState};
            }
          }
        }
        break;
      }
      case Action.LEFT: {
        if (0 < position.x) {
          switch (state[position.y][position.x - 1]) {
            case Elements.BLOCK:
              return {value: this.rBlock, done: false, newState: state};
            case Elements.HOLE:
              return {value: this.rHole, done: true, newState: state};
            case Elements.PLAYER:
              console.error(state, position)
              throw new Error('Something went wrong with action ' + Action.LEFT + ' on position');
            case Elements.GOAL:
              return {value: this.rGoal, done: true, newState: state};
            default: {
              newState[position.y][position.x - 1] = Elements.PLAYER;
              newState[position.y][position.x] = Elements.EMPTY;
              return {value: this.rStay, done: false, newState};
            }
          }
        }
        break;
      }
    }

    // action was not possible (ex. outside gridworld or into a block)
    return {value: this.rStay, done: false, newState: state};
  }

  private getQValue(qTable: number[][], state: Elements[][], action: Action): number {
    const position: Position = MazeMatrixService.playerPosition(state);
    const xIndex: number = state[position.y].length;
    const qRow: number[] = qTable[xIndex * position.y + position.x];

    return qRow[action];
  }

  private updateQTable(qTable: number[][], state: Elements[][], action: Action, qValueNEW: number): void {
    const position: Position = MazeMatrixService.playerPosition(state);
    const xIndex: number = state[position.y].length;
    qTable[xIndex * position.y + position.x][action] = qValueNEW;

    this.mazeQTableStore.update({
      state: {values: qTable}
    });
  }

  private getRandomAction(): Action {
    const actions: Action[] = MazeMatrixService.getActions();
    return actions[MazeRandomService.generateRandomNumber(0, actions.length - 1)];
  }

  private getQValueMax(qTable: number[][], state: Elements[][]): number {
    const position: Position = MazeMatrixService.playerPosition(state);
    const xIndex: number = state[position.y].length;
    const qRow: number[] = qTable[xIndex * position.y + position.x];

    return Math.max(...qRow);
  }

  private getQValueMaxOnAction(qTable: number[][], state: Elements[][]): Action {
    const position = MazeMatrixService.playerPosition(state);
    const xIndex = state[position.y].length;
    const qRow: number[] = qTable[xIndex * position.y + position.x];

    let actionIndex: Action = 0;
    let actionMax: number = qRow[actionIndex];

    for (let i = 0; i < qRow.length; i++) {
      if (qRow[i] > actionMax) {
        actionMax = qRow[i];
        actionIndex = i;
      }
    }

    return MazeMatrixService.getActions()[actionIndex];
  }

  private calculateQValue(qTable: number[][], state: Elements[][], action: Action, reward: number, newState: Elements[][]): number {
    const qValue = this.getQValue(qTable, state, action);
    const qMaxWithNewState = this.getQValueMax(qTable, newState);

    return qValue + this.alpha * (reward + this.gamma * qMaxWithNewState - qValue);
  }
}
