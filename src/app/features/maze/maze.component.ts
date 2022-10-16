import { Component, OnInit } from '@angular/core';
import { Elements, MazeMatrixModel } from './state/maze-matrix/maze-matrix.model';
import { MazeMatrixQuery } from './state/maze-matrix/maze-matrix.query';
import { MazeMatrixService } from './state/maze-matrix/maze-matrix.service';
import { MazeMatrixStore } from './state/maze-matrix/maze-matrix.store';
import { guid } from '@datorama/akita';


@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  Elements = Elements;

  maze$ = this.mazeMatrixQuery.activeMaze$;
  isLoading$ = this.mazeMatrixQuery.selectLoading();

  episodes: number = 100;

  constructor(
    private mazeMatrixQuery: MazeMatrixQuery,
    private matrixService: MazeMatrixService
  ) {
  }

  ngOnInit(): void {
  }

  start(): void {
    this.matrixService.random(this.episodes, {
      id: guid(),
      state: MazeMatrixStore.initState,
      moves: 0,
      wins: 0,
      losses: 0,
      episode: 0
    });
  }
}
