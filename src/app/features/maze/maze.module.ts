import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MazeRoutingModule } from './maze-routing.module';
import { MazeComponent } from './maze.component';


@NgModule({
  declarations: [
    MazeComponent
  ],
  imports: [
    CommonModule,
    MazeRoutingModule
  ]
})
export class MazeModule { }
