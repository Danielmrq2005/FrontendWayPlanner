import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { GastosService } from '../Servicios/gastos.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
Chart.register(ChartDataLabels);


@Component({
  selector: 'app-grafica-viaje',
  templateUrl: './grafica-viaje.component.html',
  styleUrls: ['./grafica-viaje.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BaseChartDirective]
})
export class GraficaViajeComponent implements OnInit, AfterViewInit {
  viajeId: number = 1;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public barChartOptions: ChartOptions<'bar'> = {
    parsing: undefined,
    font: undefined,
    responsive: true,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: { weight: 'bold' },
        formatter: (value) => `${value}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1000,
          precision: 0
        }
      }
    }
  };

  public barChartLabels = ['Resumen del Viaje'];
  public barChartData = [
    { data: [0], label: 'Ingresos' },
    { data: [0], label: 'Gastos' }
  ];
  public chartType: 'bar' = 'bar';
  public chartPlugins = [ChartDataLabels];

  constructor(private gastosService: GastosService) {}

  ngOnInit() {
    this.gastosService.getResumenGastos(this.viajeId).subscribe((data) => {
      this.barChartData = [
        { data: [data.totalIngresos], label: 'Ingresos' },
        { data: [data.totalGastos], label: 'Gastos' }
      ];
      if (this.chart?.chart) this.chart.chart.update();
    });
  }

  ngAfterViewInit() {
    if (this.chart?.chart) this.chart.chart.update();
  }
}
