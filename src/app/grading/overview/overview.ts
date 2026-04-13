import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-overview',
  imports: [TableModule, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export default class Overview {

}
