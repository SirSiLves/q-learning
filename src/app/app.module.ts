import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TicTacToeComponent } from './features/tic-tac-toe/tic-tac-toe.component';
import { MazeModule } from './features/maze/maze.module';
import { TicTacToeModule } from './features/tic-tac-toe/tic-tac-toe.module';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  declarations: [
    AppComponent,
    TicTacToeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MazeModule,
    TicTacToeModule,
    InputNumberModule,
    FormsModule,
    ButtonModule,
    RippleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
