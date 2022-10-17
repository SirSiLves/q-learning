import { Component, OnInit } from '@angular/core';
import { Action, Elements } from './state/maze-matrix/maze-matrix.model';
import { MazeMatrixQuery } from './state/maze-matrix/maze-matrix.query';
import { MazeMatrixService } from './state/maze-matrix/maze-matrix.service';
import { MazeMatrixStore } from './state/maze-matrix/maze-matrix.store';
import { guid } from '@datorama/akita';
import { MazeQTableQuery } from './state/maze-q-table/maze-q-table.query';
import { MazeQTableModel } from './state/maze-q-table/maze-q-table.model';


@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  Elements = Elements;

  maze$ = this.mazeMatrixQuery.activeMaze$;
  isLoading$ = this.mazeMatrixQuery.selectLoading();
  qTable$ = this.mazeQTableQuery.select();

  episodes: number = 100;

  modeOptions = [
    {label: 'Random', value: 'RND'},
    {label: 'Q-Learning', value: 'Q'},
  ];

  mode = this.modeOptions[1].value;

  actions = MazeMatrixService.getActions();
  Action = Action;

  showQTable = true;

  constructor(
    private matrixService: MazeMatrixService,
    private mazeMatrixQuery: MazeMatrixQuery,
    private mazeQTableQuery: MazeQTableQuery
  ) {
  }

  ngOnInit(): void {
  }

  start(): void {
    if (this.mode === 'RND') {
      this.matrixService.random(this.episodes, {
        id: guid(), state: MazeMatrixStore.initState, moves: 0, wins: 0, losses: 0, episode: 0
      });
    } else if (this.mode === 'Q') {
      this.matrixService.qLearning(this.episodes, {
        id: guid(), state: MazeMatrixStore.initState, moves: 0, wins: 0, losses: 0, episode: 0
      }, true);
    }
  }

  test(): void {
    this.matrixService.qLearning(this.episodes, {
      id: guid(), state: MazeMatrixStore.initState, moves: 0, wins: 0, losses: 0, episode: 0
    }, false);
  }

  getQValue(xIndex: number, yIndex: number, action: number, qTable: MazeQTableModel, state: Elements[][]): string {
    const xLength = state[yIndex].length;
    const qRow = qTable.values[xLength * yIndex + xIndex];
    return qRow[action].toString();
  }

  getQActionIndex(xIndex: number, yIndex: number, actionIndex: number, state: Elements[][]): string {
    const xLength = state[yIndex].length;
    return xLength * yIndex + xIndex + ',' + actionIndex;
  }
}
