import { Injectable } from '@angular/core';
import { Action, TttMatrixModel } from '../state/ttt-matrix.model';
import * as tf from '@tensorflow/tfjs';
import { TttMatrixService } from '../state/ttt-matrix.service';
import { Sequential } from '@tensorflow/tfjs-layers/dist/models';
import { TttMatrixStore } from '../state/ttt-matrix.store';

@Injectable({
  providedIn: 'root'
})
export class TttTensorflowService {

  // https://app.pluralsight.com/course-player?clipId=7f3fb943-4549-4a00-a12a-aa0d60fd1ea0
  // https://www.youtube.com/watch?v=5fHngyN8Qhw
  // https://www.mlq.ai/deep-reinforcement-learning-for-trading-with-tensorflow-2-0/
  // https://www.guru99.com/tensor-tensorflow.html#5
  // https://github.com/moduIo/Deep-Q-network/blob/master/DQN.ipynb

  tf = tf;
  model: any;

  constructor() {
    // define network-model
    this.model = this.tf.sequential();
    this.model.add(
      tf.layers.dense({
        inputShape: [9], // concated board size
        units: 64,
        activation: 'relu'
      })
    );

    this.model.add(
      tf.layers.dense({
        units: 64,
        activation: 'relu'
      })
    );

    this.model.add(
      tf.layers.dense({
        units: 9, // num of actions
        activation: 'softmax'
      })
    );

    this.model.compile({
      optimizer: this.tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });

    console.log('created', this.model);
  }


  policy(state: number[][]): Action {
    // return the best action given from the state

    return TttMatrixService.getActions()[0];
  }

  train(batch: any): number {
    // loss
    return 0;
  }


  start(tttMatrixModel: TttMatrixModel): void {

    let board: any = [];
    for (let key in TttMatrixStore.initState) board = board.concat(TttMatrixStore.initState[key]);
    let x = tf.tensor2d(board, [1, 9]);

    let actionValues = [0, 0, 0, 0, 0, 0, 0, 0, 0] // Q-Values for each possible action
    let y = tf.tensor2d([actionValues], [1, 9]); // 9 = num of actions

    this.model.fit(x, y, {epochs: 1}).then((test: any) => {
      console.log('fit', test);

      tf.tidy(() => {
        let nextBoard: any = [];
        for (let key in tttMatrixModel.state) nextBoard = nextBoard.concat(TttMatrixStore.initState[key]);
        let z = tf.tensor2d(board, [1, 9]);

        const pred = this.model.predict(z).dataSync(); // get q-values for each action
        console.log('predict', pred);
      });
    });


    // Workflow
    // 1. get q-values with predict from state1
    // 2. take the action with the highest q-value
    // 3. execute action
    // 4. get reward from executed action
    // 5. update q-value with returned reward on chosen action
    // 6. fit model with state1 and updated q-value list
    // 7. get q-values with predict from state2 ...
    // ... go further on step 2.




  }

}
