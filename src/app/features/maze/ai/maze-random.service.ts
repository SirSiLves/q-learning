import { Injectable } from '@angular/core';
import { MazeMatrixStore } from '../state/maze-matrix/maze-matrix.store';
import { Elements, MazeMatrixModel, Position } from '../state/maze-matrix/maze-matrix.model';
import { MazeMatrixService } from '../state/maze-matrix/maze-matrix.service';

@Injectable({
  providedIn: 'root'
})
export class MazeRandomService {

  private visualize: boolean = true;
  private visualizeTimeout = 1;

  constructor(
    private mazeMatrixStore: MazeMatrixStore,
  ) { }

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

  runMaze(startMatrix: MazeMatrixModel, episodes: number): void {
    let copiedMatrix = MazeMatrixService.copyModel(startMatrix);
    let running = true;

    copiedMatrix.moves++;

    let startPosition: Position = MazeMatrixService.playerPosition(copiedMatrix.state);
    let possibleFields: Position[] = MazeRandomService.possibleFields(startPosition, copiedMatrix.state);
    let selectedField: Position = possibleFields[MazeRandomService.generateRandomNumber(0, possibleFields.length - 1)];

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

    // call recursive
    if (episodes > 0) {
      setTimeout(() => {
        if (this.visualize) this.mazeMatrixStore.createNewState(copiedMatrix);

        // still searching through the maze
        if (running) {
          this.runMaze(copiedMatrix, episodes);
        }
        // new episode
        else {
          // reset
          copiedMatrix = {
            ...MazeMatrixService.copyModel(copiedMatrix),
            state: MazeMatrixStore.initState,
            episode: copiedMatrix.episode + 1
          }
          this.runMaze(copiedMatrix, episodes - 1);
        }
      }, this.visualize ? this.visualizeTimeout : 0);
    } else {
      this.mazeMatrixStore.createNewState(startMatrix);
      this.mazeMatrixStore.setLoading(false);
    }
  }

}
