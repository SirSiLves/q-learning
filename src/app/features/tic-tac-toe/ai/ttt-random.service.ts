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
        reward: TttMatrixService.tryActionWithReward(
          matrixModel.state, isPlaying, action
        )
      }
    });

    const filteredActionRewards = actionsRewards.filter(ar => ar.reward !== -1); // filter impossible moves
    const chosenAction = filteredActionRewards[TttRandomService.generateRandomNumber(0, filteredActionRewards.length - 1)];
    this.doAction(copyMatrix.state, chosenAction, isPlaying);
    return copyMatrix;
  }


  static generateRandomNumber = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private doAction(state: number[][], chosenAction: { action: Action; reward: number }, isPlaying: number): number[][] {
    if (chosenAction.action === Action.UP_LEFT) state[0][0] = isPlaying;
    else if (chosenAction.action === Action.UP) state[0][1] = isPlaying;
    else if (chosenAction.action === Action.UP_RIGHT) state[0][2] = isPlaying;
    else if (chosenAction.action === Action.MID_LEFT) state[1][0] = isPlaying;
    else if (chosenAction.action === Action.MID) state[1][1] = isPlaying;
    else if (chosenAction.action === Action.MID_RIGHT) state[1][2] = isPlaying;
    else if (chosenAction.action === Action.DOWN_LEFT) state[2][0] = isPlaying;
    else if (chosenAction.action === Action.DOWN) state[2][1] = isPlaying;
    else if (chosenAction.action === Action.DOWN_RIGHT) state[2][2] = isPlaying;
    else throw new Error("Could not find chosen action" + chosenAction);

    return state;
  }
}
