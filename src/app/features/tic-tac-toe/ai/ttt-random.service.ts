import { Injectable } from '@angular/core';
import { Action, TttMatrixModel } from '../state/ttt-matrix.model';
import { TttMatrixService } from '../state/ttt-matrix.service';

@Injectable({
  providedIn: 'root'
})
export class TttRandomService {

  constructor() {
  }

  random(matrixModel: TttMatrixModel): TttMatrixModel {
    const isPlaying = TttMatrixService.getIsPlaying(matrixModel.state); // X = 1 or O = 2
    let copyMatrix = TttMatrixService.copyModel(matrixModel);

    const actionsRewards: { action: Action, reward: number }[] = TttMatrixService.getActions().map(action => {
      return {
        action: action,
        reward: TttMatrixService.getActionReward(
          matrixModel.state, isPlaying, action
        )
      }
    });

    const filteredActionRewards = actionsRewards.filter(ar => ar.reward !== -1); // filter impossible moves
    const chosenAction = filteredActionRewards[TttRandomService.generateRandomNumber(0, filteredActionRewards.length - 1)];
    TttMatrixService.doAction(copyMatrix.state, chosenAction.action, isPlaying);
    return copyMatrix;
  }

  static makeRandomAction(state: number[][], isPlaying: number): number[][] {
    let copyState = TttMatrixService.copyState(state);

    const actionsRewards: { action: Action, reward: number }[] = TttMatrixService.getActions().map(action => {
      return {
        action: action,
        reward: TttMatrixService.getActionReward(
          state, isPlaying, action
        )
      }
    });

    const filteredActionRewards = actionsRewards.filter(ar => ar.reward !== -1); // filter impossible moves
    const chosenAction = filteredActionRewards[TttRandomService.generateRandomNumber(0, filteredActionRewards.length - 1)];
    TttMatrixService.doAction(copyState, chosenAction.action, isPlaying);
    return copyState;
  }


  static generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


}
