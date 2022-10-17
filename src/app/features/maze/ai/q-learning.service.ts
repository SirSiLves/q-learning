import { Injectable } from '@angular/core';
import { Action, Elements, MazeMatrixModel, Position } from '../state/maze-matrix/maze-matrix.model';
import { MazeQTableService } from '../state/maze-q-table/maze-q-table.service';
import { MazeMatrixStore } from '../state/maze-matrix/maze-matrix.store';
import { MazeQTableQuery } from '../state/maze-q-table/maze-q-table.query';
import { MazeMatrixService } from '../state/maze-matrix/maze-matrix.service';
import { RandomService } from './random.service';
import { Reward } from '../state/maze-q-table/maze-q-table.model';
import { MazeQTableStore } from '../state/maze-q-table/maze-q-table.store';

@Injectable({
  providedIn: 'root'
})
export class QLearningService {

  private visualize: boolean = true;
  private visualizeTimeout = 50;

  // Q-Learning Params
  private alpha = 0.5; // a-learning rate between 0 and 1
  private gamma = 0.9; // y-discount factor between 0-1

  // Rewards
  private rBlock = 0;
  private rStay = 0;
  private rHole = 0;
  private rGoal = 1;

  constructor(
    private mazeQTableQuery: MazeQTableQuery,
    private mazeQTableService: MazeQTableService,
    private mazeQTableStore: MazeQTableStore,
    private mazeMatrixStore: MazeMatrixStore
  ) {
  }

  runMaze(startMatrix: MazeMatrixModel, episodes: number, qTable: number[][]): void {
    let state = MazeMatrixService.copyModel(startMatrix).state;

    // if there is no q value available, take a random action
    const action: Action = this.getQValueMax(qTable, state) > 0 ? this.getQValueMaxOnAction(qTable, state) : this.getRandomAction();

    // get reward result in chosen action
    const reward: Reward = this.executeAndGetRewards(state, action);

    // update Q(s,a)
    const qValueNEW = this.calculateQValue(qTable, state, action, reward.value, reward.newState);
    this.updateQTable(qTable, state, action, qValueNEW);


    // call recursive
    if (episodes > 0) {
      setTimeout(() => {
        const newStartMatrix: MazeMatrixModel = {...startMatrix, state: reward.newState};
        if (this.visualize) this.mazeMatrixStore.createNewState(newStartMatrix);

        // still searching through the maze
        if (!reward.done) {
          newStartMatrix.moves++;
          this.runMaze(newStartMatrix, episodes, qTable); // TODO remove episodes - 1
        }
        // new episode
        else {
          if (reward.value === 0) {
            newStartMatrix.losses++;
          } else if (reward.value === 1) {
            newStartMatrix.wins++;
          }
          // reset
          const resetStartMatrix = {
            ...MazeMatrixService.copyModel(newStartMatrix),
            state: MazeMatrixStore.initState,
            episode: newStartMatrix.episode + 1
          }

          this.runMaze(resetStartMatrix, episodes - 1, qTable);
        }
      }, this.visualize ? this.visualizeTimeout : 0)
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
    const qColumn: number[] = qTable[xIndex * position.y + position.x];

    return qColumn[action];
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
    return actions[RandomService.generateRandomNumber(0, actions.length)]
  }

  private getQValueMax(qTable: number[][], state: Elements[][]): number {
    const position: Position = MazeMatrixService.playerPosition(state);
    const xIndex: number = state[position.y].length;
    const qColumn: number[] = qTable[xIndex * position.y + position.x];

    return Math.max(...qColumn);
  }

  private getQValueMaxOnAction(qTable: number[][], state: Elements[][]): Action {
    const position = MazeMatrixService.playerPosition(state);
    const xIndex = state[position.y].length;
    const qColumn: number[] = qTable[xIndex * position.y + position.x];

    let actionIndex: Action = 0;
    let actionMax: number = qColumn[actionIndex];

    for (let i = 0; i < qColumn.length; i++) {
      if (qColumn[i] > actionMax) {
        actionMax = qColumn[i];
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
