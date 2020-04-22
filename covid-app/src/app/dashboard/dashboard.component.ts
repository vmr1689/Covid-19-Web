import { Component, OnInit, NgZone, OnDestroy, AfterViewInit, ViewChild, AfterViewChecked } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_indiaLow from '@amcharts/amcharts4-geodata/indiaLow';
import * as moment from 'moment';

import { Countries, Continents } from '../../environments/environment';
import { renderTable, createChild, destroyChild } from '../shared/helpers';
import { DashboardService, SpinnerService, GuidelinesService } from '../shared/services';
import {
  Updates,
  SampleData,
  SampleStateDistrictWiseData,
  SampleUpdatesData,
  SampleWebData,
  CasesTimeSeries,
  StateWise,
  Guidelines
} from '../shared/models';

import SampleMapDataJson from '.././mapdata.json';
declare var $;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  public bannerList: SampleWebData;
  public infoIndex = 0;
  public info: string;

  public sampleData: SampleData;
  public sampleStateDistrictData: SampleStateDistrictWiseData;
  public updatesList: Updates[] = [];
  public guidelinesList: Guidelines[] = [];
  public dosList: Guidelines[] = [];
  public dontsList: Guidelines[] = [];
  public symptomsList: Guidelines[] = [];
  public mapDataList: any[] = [];

  public dailySpreadList: CasesTimeSeries[] = [];

  public mapchart: am4maps.MapChart;
  public confirmedChart: am4charts.XYChart;
  public recoveredChart: am4charts.XYChart;
  public deceasedChart: am4charts.XYChart;
  public patientGenderChart: am4charts.PieChart;
  public patientAgeChart: am4charts.XYChart;

  constructor(
    private zone: NgZone,
    private spinnerService: SpinnerService,
    private dashboardService: DashboardService,
    private guidelinesService: GuidelinesService) { }

  ngOnInit(): void {
    this.getMapData();
    this.getStateDistrictData();
    this.getGuidelines();
    this.getBannerData();
    this.getUpdatesData();
    this.getDetails();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  public getMapData() {
    this.mapDataList = SampleMapDataJson;
  }

  public getGuidelines() {
    this.guidelinesList = [];
    this.dosList = [];
    this.dontsList = [];
    this.symptomsList = [];
    this.guidelinesService.getAllGuidelines().subscribe((response: Guidelines[]) => {
      if (response) {
        this.guidelinesList = response;
        this.symptomsList = response.filter(x => x.type === 'SYMPTOMS');
        this.dontsList = response.filter(x => x.type === "DONT'S");
        this.dosList = response.filter(x => x.type === "DO'S");
      }
    });
  }

  public getStateDistrictData() {
    this.dashboardService.getStateDistrictData().subscribe((response: SampleStateDistrictWiseData) => {
      if (response) {
        this.sampleStateDistrictData = response;
      }
    });
  }

  public getDetails() {
    this.dashboardService.getDetails().subscribe((response: SampleData) => {
      if (response) {
        this.sampleData = response;
        this.renderMainData('statewise', true);
      }
      if (response && response.casestimeseries.length > 0) {
        this.dailySpreadList = response.casestimeseries.slice(-14);
        console.log(this.dailySpreadList);
        this.destroyCharts();
        this.renderDailyCharts();
      }
    });
  }

  public getBannerData() {
    this.dashboardService.getBanner().subscribe((response: SampleWebData) => {
      if (response) {
        this.bannerList = response;
        this.setIntervalBannerData();
      }
    });
  }

  public setIntervalBannerData() {
    const factoids = this.bannerList.factoids;
    this.info = factoids[0].banner;
    setInterval(() => {
      if (this.infoIndex < (this.bannerList.factoids.length - 1)) {
        this.infoIndex++;
      } else {
        this.infoIndex = 0;
      }
      this.info = this.bannerList.factoids[this.infoIndex].banner;
    }, 5000);
  }

  public getUpdatesData() {
    this.dashboardService.getUpdates().subscribe((response: SampleUpdatesData[]) => {
      let updates = [];
      this.updatesList = [];
      if (response && response.length > 0) {
        updates = response;
        updates.forEach(element => {
          if (element.timestamp) {
            const currentDate = moment(new Date());
            const updateDate = moment(new Date(element.timestamp * 1000));
            element.hours = currentDate.diff(updateDate, 'hours');
          }
        });
        const groupedUpdates = this.groupBy(updates, 'hours');
        const groupedUpdatesArray = Object.keys(groupedUpdates).map(function (hourKey) {
          const update: Updates = {
            hour: hourKey,
            updates: groupedUpdates[hourKey]
          };
          return update;
        });
        this.updatesList = groupedUpdatesArray.slice(0, 5);
      }
    });
  }

  public groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  ngAfterViewInit() {
    $('#dataTable').DataTable({
      'paging': true,
      'lengthChange': false,
      'searching': true,
      'ordering': true,
      'info': true,
      'autoWidth': true,
    });

    this.zone.runOutsideAngular(() => {
      am4core.useTheme(am4themes_animated);

      const mapchart = am4core.create('chartdiv', am4maps.MapChart);
      mapchart.responsive.enabled = true;
      mapchart.projection = new am4maps.projections.Miller();

      const polygonSeries = mapchart.series.push(new am4maps.MapPolygonSeries());
      polygonSeries.useGeodata = true;
      polygonSeries.geodata = am4geodata_indiaLow;


      // Configure series
      const polygonTemplate = polygonSeries.mapPolygons.template;
      polygonTemplate.tooltipText = '{name}:{value}';
      polygonTemplate.fill = am4core.color('#999');

      // Create hover state and set alternative fill color
      const hs = polygonTemplate.states.create('hover');
      hs.properties.fill = am4core.color('#367B25');

      // Add heat rule
      polygonSeries.heatRules.push({
        property: 'fill',
        target: polygonSeries.mapPolygons.template,
        min: am4core.color('#ffcccc'),
        max: am4core.color('#990000')
      });

      const heatLegend = mapchart.createChild(am4maps.HeatLegend);
      heatLegend.id = 'heatLegend';
      heatLegend.series = polygonSeries;
      heatLegend.align = 'right';
      heatLegend.valign = 'bottom';
      heatLegend.width = am4core.percent(50);
      heatLegend.marginRight = am4core.percent(4);
      heatLegend.background.fill = am4core.color('#000');
      heatLegend.background.fillOpacity = 0.05;
      heatLegend.padding(5, 5, 5, 5);

      polygonSeries.data = this.mapDataList;

      polygonSeries.mapPolygons.template.events.on('over', (ev) => {
        if (!isNaN(ev.target.dataItem.value)) {
          heatLegend.valueAxis.showTooltipAt(ev.target.dataItem.value);
        }
        else {
          heatLegend.valueAxis.hideTooltip();
        }
      });

      polygonSeries.mapPolygons.template.events.on('out', (ev) => {
        heatLegend.valueAxis.hideTooltip();
      });

      this.mapchart = mapchart;
      this.renderDailyCharts();
    });
  }

  public renderDailyCharts() {
    this.destroyCharts();
    this.renderConfirmedChart();
    this.renderRecoveredChart();
    this.renderDeceasedChart();
    this.renderPatientGenderChart();
    this.renderPatientAgeChart();
  }

  destroyMaps() {
    this.zone.runOutsideAngular(() => {
      if (this.mapchart) {
        this.mapchart.dispose();
      }
    });
  }

  destroyCharts() {
    this.zone.runOutsideAngular(() => {
      if (this.confirmedChart) {
        this.confirmedChart.dispose();
      }
      if (this.recoveredChart) {
        this.recoveredChart.dispose();
      }
      if (this.deceasedChart) {
        this.deceasedChart.dispose();
      }
      if (this.patientGenderChart) {
        this.patientGenderChart.dispose();
      }
      if (this.patientAgeChart) {
        this.patientAgeChart.dispose();
      }
    });
  }

  ngOnDestroy() {
    this.destroyMaps();
    this.destroyCharts();
  }

  public renderConfirmedChart() {
    const confirmedChart = am4core.create('confirmedChart', am4charts.XYChart);
    let confirmedData = [];
    if (this.dailySpreadList.length > 0) {
      confirmedData = this.dailySpreadList.map(dailyData =>
        ({
          category: dailyData.date,
          value: dailyData.totalconfirmed
        }));
    }
    confirmedChart.data = confirmedData;
    const categoryAxis = confirmedChart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = 'category';
    categoryAxis.renderer.minGridDistance = 15;
    categoryAxis.renderer.grid.template.location = 0.5;
    categoryAxis.renderer.grid.template.strokeDasharray = '1,3';
    categoryAxis.renderer.labels.template.rotation = -90;
    categoryAxis.renderer.labels.template.horizontalCenter = 'left';
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.labels.template.adapter.add('dx', (dx, target) => {
      return -target.maxRight / 2;
    });
    const valueAxis = confirmedChart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.ticks.template.disabled = true;
    valueAxis.renderer.axisFills.template.disabled = true;
    const series = confirmedChart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = 'category';
    series.dataFields.valueY = 'value';
    series.tooltipText = '{valueY.value}';
    series.fill = am4core.color('red');
    series.sequencedInterpolation = true;
    series.fillOpacity = 0;
    series.strokeOpacity = 1;
    series.columns.template.width = 0.01;
    series.tooltip.pointerOrientation = 'horizontal';
    series.bullets.create(am4charts.CircleBullet);
    confirmedChart.cursor = new am4charts.XYCursor();

    this.confirmedChart = confirmedChart;
  }

  public renderRecoveredChart() {
    const recoveredChart = am4core.create('recoveredChart', am4charts.XYChart);
    let recoveredData = [];
    if (this.dailySpreadList.length > 0) {
      recoveredData = this.dailySpreadList.map(dailyData =>
        ({
          category: dailyData.date,
          value: dailyData.totalrecovered
        }));
    }
    recoveredChart.data = recoveredData;
    const recoveredCategoryAxis = recoveredChart.xAxes.push(new am4charts.CategoryAxis());
    recoveredCategoryAxis.renderer.grid.template.location = 0;
    recoveredCategoryAxis.dataFields.category = 'category';
    recoveredCategoryAxis.renderer.minGridDistance = 15;
    recoveredCategoryAxis.renderer.grid.template.location = 0.5;
    recoveredCategoryAxis.renderer.grid.template.strokeDasharray = '1,3';
    recoveredCategoryAxis.renderer.labels.template.rotation = -90;
    recoveredCategoryAxis.renderer.labels.template.horizontalCenter = 'left';
    recoveredCategoryAxis.renderer.labels.template.location = 0.5;
    recoveredCategoryAxis.renderer.labels.template.adapter.add('dx', (dx, target) => {
      return -target.maxRight / 2;
    });
    const recoveredvalueAxis = recoveredChart.yAxes.push(new am4charts.ValueAxis());
    recoveredvalueAxis.tooltip.disabled = true;
    recoveredvalueAxis.renderer.ticks.template.disabled = true;
    recoveredvalueAxis.renderer.axisFills.template.disabled = true;
    const recoveredseries = recoveredChart.series.push(new am4charts.ColumnSeries());
    recoveredseries.dataFields.categoryX = 'category';
    recoveredseries.dataFields.valueY = 'value';
    recoveredseries.tooltipText = '{valueY.value}';
    recoveredseries.fill = am4core.color('green');
    recoveredseries.sequencedInterpolation = true;
    recoveredseries.fillOpacity = 0;
    recoveredseries.strokeOpacity = 1;
    recoveredseries.columns.template.width = 0.01;
    recoveredseries.tooltip.pointerOrientation = 'horizontal';
    recoveredseries.bullets.create(am4charts.CircleBullet);
    recoveredChart.cursor = new am4charts.XYCursor();

    this.recoveredChart = recoveredChart;
  }

  public renderDeceasedChart() {
    const deceasedChart = am4core.create('deceasedChart', am4charts.XYChart);
    let deceasedData = [];
    if (this.dailySpreadList.length > 0) {
      deceasedData = this.dailySpreadList.map(dailyData =>
        ({
          category: dailyData.date,
          value: dailyData.totaldeceased
        }));
    }
    deceasedChart.data = deceasedData;
    const deceasedCategoryAxis = deceasedChart.xAxes.push(new am4charts.CategoryAxis());
    deceasedCategoryAxis.renderer.grid.template.location = 0;
    deceasedCategoryAxis.dataFields.category = 'category';
    deceasedCategoryAxis.renderer.minGridDistance = 15;
    deceasedCategoryAxis.renderer.grid.template.location = 0.5;
    deceasedCategoryAxis.renderer.grid.template.strokeDasharray = '1,3';
    deceasedCategoryAxis.renderer.labels.template.rotation = -90;
    deceasedCategoryAxis.renderer.labels.template.horizontalCenter = 'left';
    deceasedCategoryAxis.renderer.labels.template.location = 0.5;
    deceasedCategoryAxis.renderer.labels.template.adapter.add('dx', (dx, target) => {
      return -target.maxRight / 2;
    });
    const deceasedvalueAxis = deceasedChart.yAxes.push(new am4charts.ValueAxis());
    deceasedvalueAxis.tooltip.disabled = true;
    deceasedvalueAxis.renderer.ticks.template.disabled = true;
    deceasedvalueAxis.renderer.axisFills.template.disabled = true;
    const deceasedseries = deceasedChart.series.push(new am4charts.ColumnSeries());
    deceasedseries.dataFields.categoryX = 'category';
    deceasedseries.dataFields.valueY = 'value';
    deceasedseries.tooltipText = '{valueY.value}';
    deceasedseries.fill = am4core.color('transparent');
    deceasedseries.sequencedInterpolation = true;
    deceasedseries.fillOpacity = 0;
    deceasedseries.strokeOpacity = 1;
    // series.strokeDashArray = "1,3";
    deceasedseries.columns.template.width = 0.01;
    deceasedseries.tooltip.pointerOrientation = 'horizontal';
    deceasedseries.bullets.create(am4charts.CircleBullet);
    deceasedChart.cursor = new am4charts.XYCursor();

    this.deceasedChart = deceasedChart;
  }

  public renderPatientAgeChart() {
    const chart = am4core.create('patientAgeChart', am4charts.XYChart);

    chart.data = [
      { age: '0-10', count: 61 },
      { age: '11-20', count: 130 },
      { age: '21-30', count: 334 },
      { age: '31-40', count: 382 },
      { age: '41-50', count: 267 },
      { age: '51-60', count: 226 },
      { age: '61-70', count: 153 },
      { age: '71-80', count: 47 },
      { age: '81-90', count: 7 },
      { age: '91-100', count: 2 },
    ];

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'age';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;

    categoryAxis.renderer.labels.template.adapter.add('dy', (dy, target) => {
      // if (target.dataItem && (target.dataItem.index & 2) == 2) {
      //   return dy + 25;
      // }
      return dy;
    });

    chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = 'count';
    series.dataFields.categoryX = 'age';
    series.name = 'count';
    series.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]';
    series.columns.template.fillOpacity = .8;
    series.fill = am4core.color('#DC143C');

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;

    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.clickable = false;
    chart.legend.itemContainers.template.focusable = false;
    chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
    chart.legend.data = [{
      name: 'Awaiting details for 11396',
    }];
    this.patientAgeChart = chart;
  }

  public renderPatientGenderChart() {
    const chart = am4core.create('patientGenderChart', am4charts.PieChart);

    chart.data = [
      { gender: 'Male', count: 1951, color: am4core.color('blue') },
      { gender: 'Female', count: 872, color: am4core.color('#FFB6C1') },
      { gender: 'Awaiting Details', count: 11916, color: am4core.color('#778899') }
    ];

    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = 'count';
    pieSeries.dataFields.category = 'gender';

    chart.innerRadius = am4core.percent(40);

    pieSeries.slices.template.stroke = am4core.color('white');
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template.propertyFields.fill = 'color';

    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;

    const as = pieSeries.slices.template.states.getKey('active');
    as.properties.shiftRadius = 0;
    pieSeries.slices.template.fillOpacity = 1;

    const hs = pieSeries.slices.template.states.getKey('hover');
    hs.properties.scale = 1;
    hs.properties.fillOpacity = 0.5;

    chart.legend = new am4charts.Legend();
    this.patientGenderChart = chart;
  }

  public getData(parentData: StateWise, childData: any) {
    const arr = [];
    if (parentData.state) {
      const objChild = childData[parentData.state];
      if (objChild) {
        const districtData = objChild.districtData;
        for (const key in districtData) {
          if (districtData.hasOwnProperty(key)) {
            const ss = {
              district: key,
              confirmed: districtData[key].confirmed,
              deltaConfirmed: districtData[key].delta.confirmed,
              lastupdatedtime: districtData[key].lastupdatedtime
            }
            arr.push(ss);
          }
        }
        console.log(arr);
      }
    }
    return arr;
  }

  public addClickHandler(tableRef, columns, data, isChildTable) {
    const self = this;

    tableRef.on('click', 'td.details-control', function () {
      const tr = $(this).closest('tr');
      const row = tableRef.row(tr);
      const rowData = tableRef.row($(this).closest('tr')).data();

      if (row.child.isShown()) {
        destroyChild(row);
        tr.removeClass('shown');
        $(this).html('<i class = "glyphicon glyphicon-plus-sign" style="text-align: center;cursor: pointer"> </i>');
        $(this).css({ 'text-align': 'center', cursor: 'pointer' });
      }
      else {
        const childData = self.getData(rowData, data);
        const childTableRef = createChild(row, columns, childData, rowData.lastupdatedtime, isChildTable);
        tr.addClass('shown');
        $(this).html('<i class = "glyphicon glyphicon-minus-sign" style="text-align: center;cursor: pointer"> </i>');
        $(this).css({ 'text-align': 'center', cursor: 'pointer' });

        if (isChildTable) {
          self.addClickHandler(childTableRef, columns, data, true);
        }
      }
    });
  }

  public renderMainData(tableId, childTable) {
    let tableColumns = [
      {
        title: '',
        className: 'details-control',
        createdCell: (td, cellData, rowData, row, col) => {
          if (rowData.state !== 'Total') {
            $(td).css({ 'text-align': 'center', cursor: 'pointer' });
            return '<i class = "glyphicon glyphicon-plus-sign"> </i>';
          }
        },
        data: null,
        render: (data, type, full, meta) => {
          if (full.state !== 'Total') {
            return '<i class = "glyphicon glyphicon-plus-sign" style="text-align: center;cursor: pointer"> </i>';
          } else {
            return '';
          }
        }
      },
      { title: 'Place', data: 'state' },
      { title: 'Active', data: 'active' },
      {
        title: 'Confirmed',
        data: 'confirmed',
        render: (data, type, full, meta) => {
          let html = '<div style="text-align: right;">';
          if (full.deltaconfirmed && full.deltaconfirmed > 0) {
            html += '<span style="color: red;">';
            html += '<i class="fa fa-arrow-circle-up">' + full.deltaconfirmed + '</i>';
            html += ' </span><span>' + ' ' + full.confirmed + '</span>';
            html += '</span>';
          } else {
            html += '<span>' + full.confirmed + '</span>';
          }
          html += '</div>';
          return html;
        }
      },
      {
        title: 'Deceased',
        data: 'deaths',
        render: (data, type, full, meta) => {
          let html = '<div style="text-align: right;">';
          if (full.deltadeaths && full.deltadeaths > 0) {
            html += '<span>';
            html += '<i class="fa fa-arrow-circle-up">' + full.deltadeaths + '</i>';
            html += ' </span><span>' + ' ' + full.deaths + '</span>';
            html += '</span>';
          } else {
            html += '<span>' + full.deaths + '</span>';
          }
          html += '</div>';
          return html;
        }
      },
      {
        title: 'Recovered',
        data: 'recovered',
        render: (data, type, full, meta) => {
          let html = '<div style="text-align: right;">';
          if (full.deltarecovered && full.deltarecovered > 0) {
            html += '<span style="color: green;">';
            html += '<i class="fa fa-arrow-circle-up">' + full.deltarecovered + '</i>';
            html += ' </span><span>' + ' ' + full.recovered + '</span>';
            html += '</span>';
          } else {
            html += '<span>' + full.recovered + '</span>';
          }
          html += '</div>';
          return html;
        }
      }
    ];

    if (!childTable) {
      tableColumns = [
        { title: 'Place', data: 'state' },
        { title: 'Active', data: 'active' },
        { title: 'Confirmed', data: 'confirmed' },
        { title: 'Deceased', data: 'deaths' },
        { title: 'Recovered', data: 'recovered' }
      ];
    }
    else {

    }
    const statewiseData = this.sampleData.statewise;
    const tableRef = renderTable(this, tableId, tableColumns, statewiseData, childTable);

    if (childTable) {
      const districtTableColumns = [
        {
          title: 'District',
          data: 'district',
          width: '25px !important',
        },
        {
          title: 'Confirmed',
          data: 'confirmed',
          width: '25px !important',
          render: (data, type, full, meta) => {
            let html = '<div style="text-align: right;">';
            if (full.deltaConfirmed && full.deltaConfirmed > 0) {
              html += '<span style="color: red;">';
              html += '<i class="fa fa-arrow-circle-up">' + full.deltaConfirmed + '</i>';
              html += ' </span><span>' + ' ' + full.confirmed + '</span>';
              html += '</span>';
            } else {
              html += '<span>' + full.confirmed + '</span>';
            }
            html += '</div>';
            return html;
          }
        }
      ];
      const districtWiseData = { ...this.sampleStateDistrictData };
      this.addClickHandler(tableRef, [...districtTableColumns], districtWiseData, false);
    }
  }
}



