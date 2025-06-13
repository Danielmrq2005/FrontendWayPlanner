import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {BarController, BarElement, CategoryScale, ChartConfiguration, ChartOptions, LinearScale} from 'chart.js';
import { GastosService } from '../Servicios/gastos.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { TemaService } from "../Servicios/tema.service";
import { ActivatedRoute } from "@angular/router";

// Registrar plugin para mostrar etiquetas en la gráfica
Chart.register(LinearScale, CategoryScale, BarController, BarElement, ChartDataLabels);

@Component({
  selector: 'app-grafica-viaje',
  templateUrl: './grafica-viaje.component.html',
  styleUrls: ['./grafica-viaje.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BaseChartDirective]
})
export class GraficaViajeComponent implements OnInit, AfterViewInit {
  viajeId: number = 0;    // Id del viaje para cargar datos específicos
  darkMode = false;       // Control para modo oscuro

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;  // Referencia al gráfico

  // Datos iniciales para el gráfico de barras
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Resumen del Viaje'],  // Etiquetas para el eje X
    datasets: [
      {
        data: [0],                  // Datos de ingresos (inicialmente 0)
        label: 'Ingresos',
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Color barra ingresos
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        borderRadius: 6,
        maxBarThickness: 40
      },
      {
        data: [0],                  // Datos de gastos (inicialmente 0)
        label: 'Gastos',
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Color barra gastos
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  };

  // Opciones del gráfico: diseño, estilos, animaciones, escalas y plugins
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 10, bottom: 10, left: 5, right: 5 }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: this.darkMode ? '#fff' : '#333',  // Color texto eje Y según modo
          callback: (value) => `${value}€`,        // Añadir símbolo euro a ticks
          font: { size: 12 }
        },
        grid: {
          color: this.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'  // Color rejilla eje Y
        }
      },
      x: {
        ticks: {
          color: this.darkMode ? '#fff' : '#333',  // Color texto eje X según modo
          font: { size: 12 }
        },
        grid: { display: false }  // No mostrar rejilla en eje X
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: this.darkMode ? '#fff' : '#333',  // Color etiquetas leyenda según modo
          font: { size: 14 }
        }
      },
      datalabels: {
        anchor: 'end',    // Posición de etiquetas de datos
        align: 'end',
        color: this.darkMode ? '#fff' : '#333',
        formatter: (value) => `${value}€`,  // Formato etiqueta con símbolo euro
        font: { weight: 'bold', size: 12 }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.formattedValue}€`  // Tooltip personalizado
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,   // Bordes redondeados en las barras
      }
    }
  };

  constructor(
    private gastosService: GastosService,   // Servicio para obtener datos de gastos/ingresos
    private route: ActivatedRoute,           // Para obtener parámetro viajeId de la ruta
    private temaService: TemaService          // Servicio para detectar modo oscuro
  ) {
    // Suscribirse a cambios en modo oscuro para actualizar tema del gráfico
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
      this.updateChartTheme();
    });
  }

  ngOnInit() {
    // Obtener id del viaje desde parámetros de ruta
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viajeId = +id;   // Convertir a número
        this.loadChartData(); // Cargar datos para el gráfico
      }
    });
  }

  ngAfterViewInit() {
    // Al iniciar la vista, actualizar tema para reflejar modo oscuro o claro
    this.updateChartTheme();
  }

  // Carga datos de ingresos y gastos desde el backend según viajeId
  private loadChartData() {
    this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
      if (this.barChartData.datasets) {
        this.barChartData.datasets[0].data = [data.totalIngresos];  // Actualizar datos ingresos
        this.barChartData.datasets[1].data = [data.totalGastos];    // Actualizar datos gastos
        this.updateChart();   // Refrescar gráfico con nuevos datos
      }
    });
  }

  // Actualiza colores y estilos del gráfico según el modo (oscuro o claro)
  private updateChartTheme() {
    if (this.darkMode && this.barChartOptions) {
      const options = this.barChartOptions;

      // Actualizar colores en escalas
      if (options.scales) {
        const yAxis = options.scales['y'];
        if (yAxis) {
          if (yAxis.grid) yAxis.grid.color = 'rgba(255,255,255,0.1)';  // Rejilla más clara en modo oscuro
          if (yAxis.ticks) yAxis.ticks.color = '#fff';                 // Texto blanco eje Y
        }

        const xAxis = options.scales['x'];
        if (xAxis && xAxis.ticks) {
          xAxis.ticks.color = '#fff';                                  // Texto blanco eje X
        }
      }

      // Actualizar colores en plugins
      if (options.plugins) {
        if ('datalabels' in options.plugins) {
          const datalabels = options.plugins.datalabels;
          if (datalabels) {
            datalabels.color = '#fff';                                // Etiquetas de datos en blanco
          }
        }

        if (options.plugins.legend?.labels) {
          options.plugins.legend.labels.color = '#fff';               // Leyenda en blanco
        }
      }

      this.updateChart();  // Refrescar gráfico para aplicar cambios
    }
  }

  // Refresca el gráfico (invoca el update de Chart.js)
  private updateChart() {
    if (this.chart?.chart) {
      this.chart.chart.update();
    }
  }
}
