import { Injectable } from '@angular/core';
import { Action, TttMatrixModel } from '../state/ttt-matrix.model';
import { TttMatrixService } from '../state/ttt-matrix.service';
import { MazeRandomService } from '../../maze/ai/maze-random.service';

@Injectable({
  providedIn: 'root'
})
export class TttRandomService {

  constructor() {
  }

  random(matrixModel: TttMatrixModel): TttMatrixModel {
    const isPlaying = TttMatrixService.getIsPlaying(matrixModel.state); // X = 1 or O = 2

    const availableActions = TttMatrixService.getAvailableActions(matrixModel.state);
    const action = availableActions[MazeRandomService.generateRandomNumber(0, availableActions.length - 1)];

    return {
      ...matrixModel,
      state: TttMatrixService.doAction(matrixModel.state, action, isPlaying)
    };
  }

  static makeRandomAction(state: number[][], isPlaying: number): number[][] {
    const availableActions = TttMatrixService.getAvailableActions(state);
    const action = availableActions[MazeRandomService.generateRandomNumber(0, availableActions.length - 1)];

    return TttMatrixService.doAction(state, action, isPlaying);
  }


  static generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


}
