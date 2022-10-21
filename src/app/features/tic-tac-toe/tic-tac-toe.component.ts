import { Component, OnDestroy, OnInit } from '@angular/core';
import { TttMatrixQuery } from './state/ttt-matrix.query';
import { TttMatrixService } from './state/ttt-matrix.service';
import { PlayStatus, TttMatrixModel } from './state/ttt-matrix.model';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.scss']
})
export class TicTacToeComponent implements OnInit, OnDestroy {

  private onDestroy$: Subject<void> = new Subject<void>();

  ttt$ = this.tttMatrixQuery.activeTTT$;
  isLoading$ = this.tttMatrixQuery.selectLoading();
  end$: Observable<PlayStatus | undefined> = this.ttt$.pipe(map(matrix => TttMatrixService.winnerOrDraw(matrix?.state)));

  won = false;
  draw = false;

  episodes: number = 100;

  constructor(
    private tttMatrixQuery: TttMatrixQuery,
    private tttMatrixService: TttMatrixService
  ) {
  }

  ngOnInit(): void {
    this.end$.pipe(takeUntil(this.onDestroy$)).subscribe(playStatus => {
      this.won = !!playStatus?.winner;
      this.draw = !!playStatus?.draw;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  setPiece(tttMatrixModel: TttMatrixModel, yIndex: number, xIndex: number): void {
    if (this.draw ||this.won) return;
    this.tttMatrixService.updatePlay(tttMatrixModel, yIndex, xIndex);
  }

  start(): void {
    // TODO
  }

  test(): void {
    // TODO
  }


  clear(tttMatrixModel: TttMatrixModel): void {
    if (this.won || this.draw) {
      this.tttMatrixService.reset(tttMatrixModel);
      this.won = false;
      this.draw = false;
    }
  }
}
