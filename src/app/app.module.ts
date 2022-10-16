import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TicTacToeComponent } from './features/tic-tac-toe/tic-tac-toe.component';
import { MazeModule } from './features/maze/maze.module';
import { TicTacToeModule } from './features/tic-tac-toe/tic-tac-toe.module';

@NgModule({
  declarations: [
    AppComponent,
    TicTacToeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MazeModule,
    TicTacToeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
