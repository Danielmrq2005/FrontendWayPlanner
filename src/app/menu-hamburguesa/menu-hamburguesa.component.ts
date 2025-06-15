import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {TemaService} from "../Servicios/tema.service";

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
  @Input() viajeId: number = 0;
  darkMode = false;




  @Output() expansionChange = new EventEmitter<boolean>();

  constructor(private route: ActivatedRoute, private temaService: TemaService, private router: Router) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
    this.expansionChange.emit(this.sidebarExpanded);
  }

  navegaActu() {
    const currentUrl = this.router.url;
    this.router.navigate(['/actu-usuario'], { queryParams: { returnUrl: currentUrl } });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.viajeId = +params['id'];
      }
    });

    this.pantallamMovil();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.pantallamMovil();
  }

  private pantallamMovil() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.sidebarExpanded) {
      this.sidebarExpanded = false;
      this.expansionChange.emit(this.sidebarExpanded);
    }
  }
}
