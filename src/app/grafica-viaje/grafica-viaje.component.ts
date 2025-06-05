import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { GastosService } from '../Servicios/gastos.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import {TemaService} from "../Servicios/tema.service";
import {ActivatedRoute} from "@angular/router";
Chart.register(ChartDataLabels);


@Component({
  selector: 'app-grafica-viaje',
  templateUrl: './grafica-viaje.component.html',
  styleUrls: ['./grafica-viaje.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BaseChartDirective]
})
export class GraficaViajeComponent implements OnInit, AfterViewInit {
  viajeId: number = 0;
  darkMode = false;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Resumen del Viaje'],
    datasets: [
      {
        data: [0],
        label: 'Ingresos',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        borderRadius: 6,
        maxBarThickness: 40 // ✅ Correcto aquí
      },
      {
        data: [0],
        label: 'Gastos',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        borderRadius: 6,
        maxBarThickness: 40 // ✅ Correcto aquí
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 5,
        right: 5
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: this.darkMode ? '#fff' : '#333',
          callback: (value) => `${value}€`,
          font: {
            size: 12
          }
        },
        grid: {
          color: this.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        ticks: {
          color: this.darkMode ? '#fff' : '#333',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: this.darkMode ? '#fff' : '#333',
          font: {
            size: 14
          }
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: this.darkMode ? '#fff' : '#333',
        formatter: (value) => `${value}€`,
        font: {
          weight: 'bold',
          size: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.formattedValue}€`
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,
      }
    }
  };

  constructor(
    private gastosService: GastosService,
    private route: ActivatedRoute,
    private temaService: TemaService
  ) {
    this.temaService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
      this.updateChartTheme();
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.viajeId = +id;
        this.loadChartData();
      }
    });
  }

  ngAfterViewInit() {
    this.updateChartTheme();
  }

  private loadChartData() {
    this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
      if (this.barChartData.datasets) {
        this.barChartData.datasets[0].data = [data.totalIngresos];
        this.barChartData.datasets[1].data = [data.totalGastos];
        this.updateChart();
      }
    });
  }

  private updateChartTheme() {
    if (this.darkMode && this.barChartOptions) {
      const options = this.barChartOptions;

      // Update scales
      if (options.scales) {
        // Update y axis
        const yAxis = options.scales['y'];
        if (yAxis) {
          if (yAxis.grid) yAxis.grid.color = 'rgba(255,255,255,0.1)';
          if (yAxis.ticks) yAxis.ticks.color = '#fff';
        }

        // Update x axis
        const xAxis = options.scales['x'];
        if (xAxis && xAxis.ticks) {
          xAxis.ticks.color = '#fff';
        }
      }

      // Update plugins
      if (options.plugins) {
        // Update datalabels
        if ('datalabels' in options.plugins) {
          const datalabels = options.plugins.datalabels;
          if (datalabels) {
            datalabels.color = '#fff';
          }
        }

        // Update legend
        if (options.plugins.legend?.labels) {
          options.plugins.legend.labels.color = '#fff';
        }
      }

      this.updateChart();
    }
  }

  private updateChart() {
    if (this.chart?.chart) {
      this.chart.chart.update();
    }
  }
}
