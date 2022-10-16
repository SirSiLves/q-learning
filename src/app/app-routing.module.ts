import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MazeComponent } from './features/maze/maze.component';
import { AppComponent } from './app.component';
import { TicTacToeComponent } from './features/tic-tac-toe/tic-tac-toe.component';

const routes: Routes = [
  {
    path: '', component: AppComponent
  },
  {
    path: 'maze', component: MazeComponent
  },
  {
    path: 'tictactoe', component: TicTacToeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
