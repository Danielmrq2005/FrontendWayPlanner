import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss'],
  standalone: true,
  imports: [
    IonicModule
  ]
})
export class AjustesComponent  implements OnInit {

  constructor(private router: Router) { }

  logout() {
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  ngOnInit() {}

}
