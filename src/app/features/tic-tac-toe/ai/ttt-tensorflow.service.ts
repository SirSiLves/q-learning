import { Injectable } from '@angular/core';
import { Action, RewardState, PlayStatus } from '../state/ttt-matrix.model';
import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import { TttMatrixStore } from '../state/ttt-matrix.store';
import { TttMatrixService } from '../state/ttt-matrix.service';
import { MazeRandomService } from '../../maze/ai/maze-random.service';
import { TttRandomService } from './ttt-random.service';
import { guid } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class TttTensorflowService {

  // https://app.pluralsight.com/course-player?clipId=7f3fb943-4549-4a00-a12a-aa0d60fd1ea0
  // https://www.youtube.com/watch?v=5fHngyN8Qhw
  // https://www.mlq.ai/deep-reinforcement-learning-for-trading-with-tensorflow-2-0/
  // https://www.guru99.com/tensor-tensorflow.html#5
  // https://github.com/moduIo/Deep-Q-network/blob/master/DQN.ipynb
  // https://www.datacamp.com/tutorial/investigating-tensors-pytorch
  // https://the-mvm.github.io/deep-q-learning-tic-tac-toe.html
  // https://gretel.ai/gretel-synthetics-faqs/how-many-epochs-should-i-train-my-model-with
  // https://ai.stackexchange.com/questions/34589/using-softmax-non-linear-vs-linear-activation-function-in-deep-reinforceme
  // http://iliasmirnov.com/ttt/
  // https://js.tensorflow.org/api/latest/#tf.Sequential.fitDataset

  // q-learning hyperparameters
  private readonly alpha = 0.5; // a-learning rate between 0 and 1
  private readonly gamma = 0.9; // y-discount factor between 0 and 1 - gammas should correspond to the size of observation space: you should use larger gammas (ie closer to 1) for big state spaces, and smaller gammas for smaller spaces.
  private epsilon = 0.9; // exploitation vs exploration between 0 and 1
  private readonly epsilonDecay = 0.00001; // go slightly for more exploitation instead of exploration
  private readonly epsilonDecrease = true; // go slightly for more exploitation instead of exploration
  private replayBuffer: { state: number[], actions: number[] }[] = [];
  private readonly batchSize = 32;
  private readonly epochs = 9; // the validation loss going to increase that means overfitting than reduce epochs
  private readonly modelName = 'ttt-dqn-model-1';
  private readonly targetUpdateInterval = 512;
  private targetUpdateValue = this.targetUpdateInterval;

  // game variables
  private readonly NUM_BOARD_HEIGHT = 3;
  private readonly NUM_BOARD_WIDTH = 3;
  private readonly NUM_MOVES = 9;

  // AI learning verification
  public aiQWins: number = 0;
  public aiRndWins: number = 0;
  public draws: number = 0;
  public playedGames: number = 0;


  private tf = tf;
  private learningModel: any;
  private targetModel: any;
  private optimizer: any;

  constructor(
    private tttMatrixStore: TttMatrixStore
  ) {
    this.initializeModels();
  }

  private initializeModels(): void {
    // try to load model from local storage
    tf.loadLayersModel('localstorage://' + this.modelName).then(response => {
      this.learningModel = response;
      this.targetModel = this.buildModel();

      this.syncNetworksWeights();
      this.compileNetworks();
      console.log('MODEL loaded');

    }).catch(error => {
      console.error('MODEL not loaded from storage. New one will be created', error);
      this.learningModel = this.buildModel();
      this.targetModel = this.buildModel();

      this.compileNetworks();
    });
  }

  private buildModel(): any {
    // define and get network-model
    const model = this.tf.sequential();
    model.add(
      tf.layers.dense({
        inputShape: [this.NUM_BOARD_HEIGHT * this.NUM_BOARD_WIDTH], // concated board size, single array of board
        units: 9,
        activation: 'relu'
      })
    );

    model.add(
      tf.layers.dense({
        units: 128,
        activation: 'relu'
      })
    );

    model.add(
      tf.layers.dense({
        units: 128,
        activation: 'relu'
      })
    );

    model.add(
      tf.layers.dense({
        units: this.NUM_MOVES, // num of actions,
        activation: 'linear'
      })
    );

    return model;
  }

  private syncNetworksWeights(): void {
    for (let i = 0; i < this.learningModel.layers.length; i++) {
      this.targetModel.layers[i].setWeights(this.learningModel.layers[i].getWeights());
    }

    this.targetModel.save('localstorage://' + this.modelName); // https://www.tensorflow.org/js/guide/save_load
    console.log('dqn saved');
  }

  private compileNetworks(): void {
    this.optimizer = tf.train.adam(0.0001)

    this.learningModel.compile({
      optimizer: this.optimizer,
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });

    this.targetModel.compile({
      optimizer: this.optimizer,
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });
  }


  loadModel(model: File, weights: File): void {
    tf.loadLayersModel(tf.io.browserFiles([model, weights])).then(response => {
      this.learningModel = response;
      this.targetModel = this.buildModel();
      this.syncNetworksWeights();

      this.targetModel.save('localstorage://' + this.modelName); // https://www.tensorflow.org/js/guide/save_load
      console.log('model updated', response);
    });
  }

  downloadDQNModel(): void {
    this.targetModel.save('downloads://' + this.modelName); // https://www.tensorflow.org/js/guide/save_load
  }


  private getFlattedBoard(matrix: number[][]): number[] {
    let flattedBoard: number[] = [];
    for (let key in matrix) flattedBoard = flattedBoard.concat(matrix[key]);

    return flattedBoard;
  }

  private getTensorFromState(matrix: number[]): Tensor {
    return tf.tensor(matrix, [1, this.NUM_BOARD_HEIGHT * this.NUM_BOARD_WIDTH]);
  }

  private async getQValuesFromState(matrix: number[][]): Promise<any> {
    const tensor = this.getTensorFromState(this.getFlattedBoard(matrix));

    return tf.tidy(() => {
      // get q-values for each action
      return this.targetModel.predict(tensor).dataSync();
    });
  }


  train(startState: number[][], episodes: number, isPlaying: number): void {
    if (episodes <= 0) {
      this.syncNetworksWeights();

      this.tttMatrixStore.createNewState({
        id: guid(),
        episode: this.playedGames,
        state: TttMatrixStore.initState,
        wins: this.aiQWins,
        losses: this.playedGames - this.aiQWins - this.draws,
        moves: 0
      });

      this.tttMatrixStore.setLoading(false);
      console.log('END');
      return;
    }

    let state = TttMatrixService.copyState(startState);

    // 1. get q-values with predict from stateX
    this.getQValuesFromState(state).then((qValues: number[]) => {

      // 2. take the possible action with the highest q-value
      const action: Action = this.chooseActionWithEpsilonGreedy(qValues, state);

      if (this.getFlattedBoard(state)[action] !== 0) {
        console.error('INVALID MOVE', state, 'action: ' + action, TttMatrixService.winnerOrDraw(state));
      }

      // 3. execute action && get reward from executed action
      const {
        reward, state: newState, winnerOrDraw
      }: RewardState = TttMatrixService.executeActionWithReward(state, isPlaying, action);

      // 4. update q-value with returned reward on chosen action - set 0 to terminal state
      const newQValues = this.calculateQValues(qValues, reward, action, newState, winnerOrDraw);

      // 5. write move into replay buffer - increases learning performance
      this.replayBuffer.push(this.getBatch(newQValues, state));

      // 6.1 fit model with replay buffer after amount of moves
      if (this.replayBuffer.length >= this.batchSize || episodes <= 1) {
        this.fitQValues().then(trainHistory => {
          console.log(trainHistory.history.loss[0], trainHistory.history.mse[0], this.epsilon, trainHistory)

          // console.log(
          //   'GAMES: ' + this.playedGames,
          //   'WINS: ' + this.aiQWins,
          //   'LOSS: ' + (this.playedGames - this.aiQWins - this.draws),
          //   'DRAWS: ' + this.draws,
          //   'WIN RATE: ' + (this.aiQWins / (this.playedGames - this.draws) * 100) + '%'
          // );

          this.nextMove(episodes, isPlaying, newState, winnerOrDraw);
        });
      }
      // 6.2 go further until batch size is reached
      else {
        this.nextMove(episodes, isPlaying, newState, winnerOrDraw);
      }
    });
  }

  private nextMove(episodes: number, isPlaying: number, newState: number[][], winnerOrDraw: undefined | PlayStatus): void {
    if (winnerOrDraw) {
      this.nextEpisode(winnerOrDraw, isPlaying, episodes);
    } else {
      // 6.2 go to step 1. with stateX+1
      this.train(newState, episodes, isPlaying);
    }
  }

  private nextEpisode(winnerOrDraw: PlayStatus, isPlaying: number, episodes: number) {
    if (this.epsilonDecrease) this.epsilon = Math.max(this.epsilon - this.epsilonDecay, 0.1);

    this.playedGames += 1;

    if (!winnerOrDraw.draw) {
      if (winnerOrDraw.winner === isPlaying) this.aiQWins += 1;
      else this.aiRndWins += 1;
    } else {
      this.draws += 1;
    }

    this.targetUpdateValue -= 1;

    if (this.targetUpdateValue <= 0) {
      this.syncNetworksWeights();
      this.targetUpdateValue = this.targetUpdateInterval;

      this.tttMatrixStore.createNewState({
        id: guid(),
        episode: this.playedGames,
        state: TttMatrixStore.initState,
        wins: this.aiQWins,
        losses: this.playedGames - this.aiQWins - this.draws,
        moves: 0
      });


    }

    // 6.1 go to step 1. with init state decrease episode
    this.train(TttMatrixStore.initState, episodes - 1, isPlaying === 1 ? 2 : 1);
  }

  private chooseActionWithEpsilonGreedy(qValues: any, state: number[][]): Action {
    // exploitation vs exploration, if random is smaller than epsilon go for exploration
    const random = MazeRandomService.generateRandomNumber(0, 10) / 10; // between 0 & 1
    const availableActions = TttMatrixService.getAvailableActions(state);

    if (random < this.epsilon) {
      // take random move
      return availableActions[MazeRandomService.generateRandomNumber(0, availableActions.length - 1)];
    } else {
      // take best move - action and q values must have the same length
      return this.getQMaxAction(availableActions, qValues);
    }
  }

  private calculateQValues(qValues: number[], reward: number, action: Action, newState: number[][], winnerOrDraw: undefined | PlayStatus): number[] {
    const oldQValue = qValues[action];
    const qMaxWithNewState = winnerOrDraw ? 0 : this.getQValueMaxFromState(newState);
    const newQValue = oldQValue + this.alpha * (reward + this.gamma * qMaxWithNewState - oldQValue);

    const newQValues = [...qValues];
    newQValues[action] = newQValue;

    return newQValues;
  }

  private getQValueMaxFromState(newState: number[][]): number {
    const stateTensor = this.getTensorFromState(this.getFlattedBoard(newState));
    const prediction: number[] = this.targetModel.predict(stateTensor).dataSync();

    const availableActions: Action[] = TttMatrixService.getAvailableActions(newState);
    if (availableActions.length <= 0) {
      console.error(newState);
      throw new Error('There should be some possible actions');
    }

    const action: Action = this.getQMaxAction(availableActions, prediction);

    return prediction[action];
  }

  private fitQValues(): Promise<any> {
    const states: number[][] = this.replayBuffer.map(b => b.state);
    const actionQValues: number[][] = this.replayBuffer.map(a => a.actions);

    this.replayBuffer = [];

    const dataStates = tf.data.array(states);
    const dataActionQValues = tf.data.array(actionQValues);

    const dataset = tf.data.zip({xs: dataStates, ys: dataActionQValues}).batch(states.length);

    // const stateTensor = tf.tensor(states[0], [1, this.NUM_BOARD_HEIGHT * this.NUM_BOARD_WIDTH]);
    // const actionQTensor = tf.tensor(actionQValues[0], [1, TttMatrixService.getActions().length]);
    //
    // return this.learningModel.fit(stateTensor, actionQTensor, {
    //   epochs: this.epochs,
    //   batchSize: states.length
    // });

    return this.learningModel.fitDataset(dataset, {
      epochs: this.epochs,
      batchSize: states.length
    });
  }

  private getBatch(newQValues: number[], state: number[][]): { state: number[], actions: number[] } {
    const states: number[] = this.getFlattedBoard(state);

    // const stateTensor = this.getTensorFromState(this.getFlattedBoard(state));
    // const actionQTensor = tf.tensor2d([newQValues], [1, TttMatrixService.getActions().length]);

    return {state: states, actions: newQValues};
  }

  predict(state: number[][]): Action {
    const stateTensor = this.getTensorFromState(this.getFlattedBoard(state));
    const actionQValues = this.targetModel.predict(stateTensor).dataSync();
    const availableActions: Action[] = TttMatrixService.getAvailableActions(state);
    console.log('PREDICT', actionQValues, availableActions, this.getQMaxAction(availableActions, actionQValues));

    return this.getQMaxAction(availableActions, actionQValues);
  }

  private getQMaxAction(availableActions: Action[], qValues: number[]): Action {
    let actionIndex: Action = 0;
    let actionQMax: number = qValues[availableActions[actionIndex]];

    for (let i = 0; i < availableActions.length; i++) {
      const availableAction: Action = availableActions[i];

      if (qValues[availableAction] > actionQMax) {
        actionIndex = i;
        actionQMax = qValues[availableActions[actionIndex]];
      }
    }

    return availableActions[actionIndex];
  }

  private executeOpponentMove(newState: number[][], isPlaying: number) {
    return TttRandomService.makeRandomAction(newState, isPlaying);
  }

  test(startState: number[][], episodes: number, isPlaying: number) {
    if (episodes <= 0) {
      this.tttMatrixStore.createNewState({
        id: guid(),
        episode: this.playedGames,
        state: TttMatrixStore.initState,
        wins: this.aiQWins,
        losses: this.playedGames - this.aiQWins - this.draws,
        moves: 0
      });

      this.tttMatrixStore.setLoading(false);
      console.log('END');
      return;
    }

    let state = TttMatrixService.copyState(startState);

    // 1. get q-values with predict from stateX
    this.getQValuesFromState(state).then((qValues: number[]) => {

      // 2. take the possible action with the highest q-value
      const availableActions = TttMatrixService.getAvailableActions(state);
      const action: Action = this.getQMaxAction(availableActions, qValues);

      if (this.getFlattedBoard(state)[action] !== 0) {
        console.error('INVALID MOVE', state, 'action: ' + action, TttMatrixService.winnerOrDraw(state));
      }

      // 3. execute action && get reward from executed action
      const {
        reward, state: newState, winnerOrDraw
      }: RewardState = TttMatrixService.executeActionWithReward(state, isPlaying, action);

      if (winnerOrDraw) {
        this.playedGames += 1;

        if (!winnerOrDraw.draw) {
          if (winnerOrDraw.winner === isPlaying) this.aiQWins += 1;
          else this.aiRndWins += 1;
        } else {
          this.draws += 1;
        }

        console.log(
          'GAMES: ', this.playedGames,
          'WINS: ', this.aiQWins,
          'LOSS: ', (this.playedGames - this.aiQWins - this.draws),
          'DRAWS: ', this.draws,
          'WIN RATE: ', (this.aiQWins / (this.playedGames - this.draws) * 100) + '%'
        );

        this.test(TttMatrixStore.initState, episodes - 1, isPlaying === 1 ? 2 : 1);

      } else {
        this.test(newState, episodes, isPlaying);
      }
    });
  }

  reset(): void {
    this.playedGames = 0;
    this.aiQWins = 0;
    this.aiRndWins = 0;
    this.draws = 0;
  }


  // TESTING
  // testing(tttMatrixModel: TttMatrixModel): void {
  //
  //   // Workflow
  //   // 1. get q-values with predict from state1
  //   // 2. take the action with the highest q-value
  //   // 3. execute action
  //   // 4. get reward from executed action
  //   // 5. update q-value with returned reward on chosen action
  //   // 6. fit model with state1 and updated q-value list
  //   // 7. get q-values with predict from state2 ...
  //   // ... go further on step 2.
  //
  //   let board: number[] = this.getFlattedBoard(TttMatrixStore.initState);
  //   let x = tf.tensor2d(board, [1, 9]);
  //
  //   let actionValues = [0, 0, 0, 0, 0, 0, 0, 0, 0] // Q-Values for each possible action
  //   let y = tf.tensor2d([actionValues], [1, 9]); // 9 = num of actions
  //
  //   this.model.fit(x, y, {epochs: 1}).then((test: any) => {
  //     console.log('fit', test);
  //
  //     tf.tidy(() => {
  //       let nextBoard: any = [];
  //       for (let key in tttMatrixModel.state) nextBoard = nextBoard.concat(TttMatrixStore.initState[key]);
  //       let z = tf.tensor2d(board, [1, 9]);
  //
  //       const pred = this.model.predict(z).dataSync(); // get q-values for each action
  //       console.log('predict', pred);
  //     });
  //   });
  // }


}
