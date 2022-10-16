import { Injectable } from '@angular/core';
import { MazeMatrixStore } from './maze-matrix.store';
import { Elements, MazeMatrixModel, Position } from './maze-matrix.model';
import { MazeMatrixQuery } from './maze-matrix.query';

@Injectable({providedIn: 'root'})
export class MazeMatrixService {

  constructor(
    private mazeMatrixStore: MazeMatrixStore,
    private matrixQuery: MazeMatrixQuery
  ) {
  }

  static possibleFields(position: Position, state: Elements[][]): Position[] {
    let positions = [];

    // UP
    if (0 < position.y && state[position.y - 1][position.x] !== Elements.BLOCK) {
      positions.push({
        x: position.x,
        y: position.y - 1
      });
    }

    // RIGHT
    if (position.x < state[position.y].length - 1 && state[position.y][position.x + 1] !== Elements.BLOCK) {
      positions.push({
        x: position.x + 1,
        y: position.y
      });
    }

    // DOWN
    if (position.y < state.length - 1 && state[position.y + 1][position.x] !== Elements.BLOCK) {
      positions.push({
        x: position.x,
        y: position.y + 1
      });
    }


    // LEFT
    if (0 < position.x && state[position.y][position.x - 1] !== Elements.BLOCK) {
      positions.push({
        x: position.x - 1,
        y: position.y
      });
    }

    return positions;
  }

  static generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  random(episodes: number, startMatrix: MazeMatrixModel): void {
    this.mazeMatrixStore.setLoading(true);
    this.runMaze(startMatrix, episodes);
  }

  private static playerPosition(state: Elements[][]): Position {
    for (let y = 0; y < state.length; y++) {
      for (let x = 0; x < state.length; x++) {
        if (state[y][x] === Elements.PLAYER) return {x, y};
      }
    }

    throw new Error("Could not find player position in: " + state);
  }

  static copy(matrix: MazeMatrixModel): MazeMatrixModel {
    const len = matrix.state.length, copiedState = new Array(len);
    for (let i = 0; i < len; ++i) copiedState[i] = matrix.state[i].slice(0);

    return {...matrix, state: copiedState};
  }

  private runMaze(startMatrix: MazeMatrixModel, episodes: number): void {
    let copiedMatrix = MazeMatrixService.copy(startMatrix);
    let running = true;

    copiedMatrix.moves++;

    let startPosition: Position = MazeMatrixService.playerPosition(copiedMatrix.state);
    let possibleFields: Position[] = MazeMatrixService.possibleFields(startPosition, copiedMatrix.state);
    let selectedField: Position = possibleFields[MazeMatrixService.generateRandomNumber(0, possibleFields.length - 1)];

    // Win or Loss
    switch (copiedMatrix.state[selectedField.y][selectedField.x]) {
      case Elements.GOAL: {
        running = false;
        copiedMatrix.wins++;
        copiedMatrix.state[startPosition.y][startPosition.x] = Elements.EMPTY;
        break;
      }
      case Elements.HOLE: {
        copiedMatrix.losses++;
        copiedMatrix.state[startPosition.y][startPosition.x] = Elements.EMPTY;
        running = false;
        break;
      }
      default: {
        copiedMatrix.state[selectedField.y][selectedField.x] = Elements.PLAYER;
        copiedMatrix.state[startPosition.y][startPosition.x] = Elements.EMPTY;

        startPosition = selectedField;
        break;
      }
    }

    // cal recursive
    if (episodes > 0) {
      setTimeout(() => {
        this.mazeMatrixStore.createNewState(copiedMatrix);

        // still searching through the maze
        if (running) {
          this.runMaze(copiedMatrix, episodes);
        }
        // new episode
        else {
          // reset
          copiedMatrix = {
            ...MazeMatrixService.copy(copiedMatrix),
            state: MazeMatrixStore.initState,
            episode: copiedMatrix.episode + 1
          }
          this.runMaze(copiedMatrix, episodes - 1);
        }
      }, 50);
    }
    else {
      this.mazeMatrixStore.setLoading(false);
    }
  }
}
