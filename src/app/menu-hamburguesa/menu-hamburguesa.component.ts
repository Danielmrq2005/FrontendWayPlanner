import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-menu-hamburguesa',
  templateUrl: './menu-hamburguesa.component.html',
  styleUrls: ['./menu-hamburguesa.component.scss'],
  imports: [
    IonicModule,
    RouterLink
  ],
  standalone: true
})
export class MenuHamburguesaComponent  implements OnInit {
  sidebarExpanded = false;

  // menu-hamburguesa.component.ts
  @Output() expansionChange = new EventEmitter<boolean>();

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
    this.expansionChange.emit(this.sidebarExpanded);

    const content = document.querySelector('.main-content') as HTMLElement;
    if (content) {
      content.style.marginLeft = this.sidebarExpanded ? '200px' : '60px';
    }
  }


  ngOnInit() {}

}
