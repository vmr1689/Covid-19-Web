import { Component, OnInit, NgZone, OnDestroy, AfterViewInit, ViewChild, AfterViewChecked } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_indiaLow from '@amcharts/amcharts4-geodata/indiaLow';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

import { environment } from '../../environments/environment';
import { renderTable, createChild, destroyChild } from '../shared/helpers';
import { DashboardService, SpinnerService, GuidelinesService, UpdatesService } from '../shared/services';
import {
  Updates,
  SampleData,
  SampleStateDistrictWiseData,
  CasesTimeSeries,
  Guidelines,
  Banner,
  Updatedto,
  AgeChart,
  Location,
  CovidInfo,
  CountryDivision,
  MapData
} from '../shared/models';

import IndiaDivisions from '.././IndiaDivisions.json';

declare var $;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

  public bannerList: Banner[];
  public infoIndex = 0;
  public info: string;
  public lastUpdatedTime: string;

  public sampleData: SampleData;
  public sampleStateDistrictData: SampleStateDistrictWiseData;
  public updatesList: Updates[] = [];
  public guidelinesList: Guidelines[] = [];
  public dosList: Guidelines[] = [];
  public dontsList: Guidelines[] = [];
  public symptomsList: Guidelines[] = [];
  public ageChartList: AgeChart[] = [];
  public mapDataList: MapData[] = [];
  public covidInfoPlace: Location = {} as Location;
  public covidInfo: CovidInfo = {} as CovidInfo;

  public dailySpreadList: CasesTimeSeries[] = [];

  public mapchart: am4maps.MapChart;
  public confirmedChart: am4charts.XYChart;
  public recoveredChart: am4charts.XYChart;
  public deceasedChart: am4charts.XYChart;
  public patientGenderChart: am4charts.PieChart;
  public patientAgeChart: am4charts.XYChart;

  public targetRegion: string;
  public countryDivisions: CountryDivision = IndiaDivisions;

  constructor(
    private zone: NgZone,
    private updatesService: UpdatesService,
    private spinnerService: SpinnerService,
    private dashboardService: DashboardService,
    private guidelinesService: GuidelinesService) {
    const date = new Date();
    this.lastUpdatedTime = 'Last Updated on ' + date.toString();
    this.targetRegion = environment.targetLocation;
  }

  ngOnInit(): void {
    this.getAllAPIValues();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  public getMapData(response: Location) {
    const subOrdinates = response.subordinates ? response.subordinates : [];
    this.mapDataList = [];
    const divisions = [...this.countryDivisions.divisions];

    divisions.forEach(item => {
      const dt: MapData = {
        id: item.code,
        name: item.name,
        value: 0
      };
      this.mapDataList.push(dt);
    });

    this.mapDataList.forEach(item => {
      const result = subOrdinates.find(x => x.placeName.trim().toLowerCase() == item.name.trim().toLowerCase());

      if (result) {
        item.value = result.covidInfo ? result.covidInfo.confirmed : 0;
      }
    });
    //console.log(this.mapDataList);
    // subOrdinates.forEach(item => {
    //   const mapData = {} as MapData;
    //   mapData.name = item.placeName;
    //   mapData.value = item.covidInfo ? item.covidInfo.confirmed : 0;
    //   const division = this.countryDivisions.divisions.find(x => x.name.trim().toLowerCase() == item.placeName.trim().toLowerCase());
    //   if (division) {
    //     mapData.id = 'IN-' + division.code;
    //   }
    //   this.mapDataList.push(mapData);
    // });
    this.destroyMaps();
    this.renderMapChart();
  }

  public getAllAPIValues() {

    const getAllGuidelines = this.guidelinesService.getAllGuidelines();
    const getAllBanners = this.updatesService.getAllBanners();
    const getAllUpdates = this.updatesService.getAllUpdates();
    const getAllAgeChartData = this.dashboardService.getAllAgeChartData(environment.targetLocation);
    const getCovidInfoByPlace = this.dashboardService.getCovidInfoByPlace(environment.targetLocation);
    const getDailyCountData = this.dashboardService.getDetails();

    this.spinnerService.show();

    forkJoin([
      getAllGuidelines,
      getAllBanners,
      getAllUpdates,
      getAllAgeChartData,
      getCovidInfoByPlace,
      getDailyCountData]).subscribe(results => {

        const guidelinesResult = results[0];
        const BannerResult = results[1];
        const updatesResult = results[2];
        const ageChartResult = results[3];
        const covidInfoResult = results[4];
        const getDailyCountResult = results[5];

        if (guidelinesResult && guidelinesResult.length > 0) {
          this.getGuidelines(guidelinesResult);
        }

        if (BannerResult && BannerResult.length > 0) {
          this.getBannerData(BannerResult);
        }

        if (updatesResult && updatesResult.length > 0) {
          this.getUpdatesData(updatesResult);
        }

        if (ageChartResult && ageChartResult.length > 0) {
          this.getAgeChartData(ageChartResult);
        }

        if (covidInfoResult) {
          this.getCovidInfoByPlace(covidInfoResult);

          this.getMapData(covidInfoResult);
        }

        if (getDailyCountResult) {
          this.getDetails(getDailyCountResult);
        }

      }).add(() => {
        this.spinnerService.hide();
      });
  }

  public getCovidInfoByPlace(response: Location) {
    this.covidInfoPlace = {} as Location;
    this.covidInfo = {} as CovidInfo;

    if (response) {
      this.covidInfoPlace = response;
      this.covidInfo = response.covidInfo;
      if (this.patientGenderChart) {
        this.patientGenderChart.dispose();
      }
      this.renderPatientGenderChart();
      this.renderMainData('locationTable', true);
    }

  }

  public getAgeChartData(response: AgeChart[]) {
    this.ageChartList = [];
    if (response) {
      this.ageChartList = response;
      if (this.patientAgeChart) {
        this.patientAgeChart.dispose();
      }
      this.renderPatientAgeChart();
    }
  }

  public getGuidelines(response: Guidelines[]) {
    this.guidelinesList = [];
    this.dosList = [];
    this.dontsList = [];
    this.symptomsList = [];

    if (response) {
      this.guidelinesList = response;
      this.symptomsList = response.filter(x => x.type === `SYMPTOMS`);
      this.dontsList = response.filter(x => x.type === `DONT'S`);
      this.dosList = response.filter(x => x.type === `DO'S`);
    }
  }

  public getDetails(response: SampleData) {
    if (response) {
      this.sampleData = response;
    }
    if (response && response.casestimeseries.length > 0) {
      this.dailySpreadList = response.casestimeseries.slice(-14);
      this.destroyCharts();
      this.renderDailyCharts();
    }
  }

  public getBannerData(response: Banner[]) {
    if (response) {
      this.bannerList = response;
      this.setIntervalBannerData();
    }
  }

  public setIntervalBannerData() {
    const bannerList = this.bannerList;
    this.info = bannerList[0].content;
    setInterval(() => {
      if (this.infoIndex < (this.bannerList.length - 1)) {
        this.infoIndex++;
      } else {
        this.infoIndex = 0;
      }
      this.info = this.bannerList[this.infoIndex].content;
    }, 5000);
  }

  public getUpdatesData(response: Updatedto[]) {

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
      const groupedUpdatesArray = Object.keys(groupedUpdates).map((hourKey) => {
        const update: Updates = {
          hour: hourKey,
          updates: groupedUpdates[hourKey]
        };
        return update;
      });
      this.updatesList = groupedUpdatesArray.slice(0, 5);
    }

  }

  public groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  ngAfterViewInit() {
  }

  public renderMapChart() {
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

    chart.data = this.ageChartList;

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

    // chart.legend = new am4charts.Legend();
    // chart.legend.itemContainers.template.clickable = false;
    // chart.legend.itemContainers.template.focusable = false;
    // chart.legend.itemContainers.template.cursorOverStyle = am4core.MouseCursorStyle.default;
    // chart.legend.data = [{
    //   name: 'Awaiting details for 11396',
    // }];
    this.patientAgeChart = chart;
  }

  public renderPatientGenderChart() {
    const chart = am4core.create('patientGenderChart', am4charts.PieChart);

    chart.data = [
      { gender: 'Male', count: this.covidInfo.maleCount ? this.covidInfo.maleCount : 0, color: am4core.color('blue') },
      { gender: 'Female', count: this.covidInfo.femaleCount ? this.covidInfo.femaleCount : 0, color: am4core.color('#FFB6C1') },
      { gender: 'Others', count: this.covidInfo.othersCount ? this.covidInfo.othersCount : 0, color: am4core.color('#778899') }
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

  public getSelfData(childData: Location[]) {
    const arr: any[] = [];
    if (childData && childData.length > 0) {
      childData.forEach(item => {
        const data = {
          placeName: item.placeName,
          active: item.covidInfo.active,
          confirmed: item.covidInfo.confirmed,
          deceased: item.covidInfo.deceased,
          recovered: item.covidInfo.recovered,
          conFirmedToday: item.covidInfo.conFirmedToday,
          activeToday: item.covidInfo.activeToday,
          deceasedToday: item.covidInfo.deceasedToday,
          recoveredToday: item.covidInfo.recoveredToday,
          subordinates: item.subordinates ? item.subordinates : []
        };
        arr.push(data);
      });
    }
    return arr;
  }

  public addClickHandler(tableRef, columns, data) {
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
        if (rowData) {
          if (!rowData.subordinates) {
            rowData.subordinates = [];
          }
          const childData = self.getSelfData(rowData.subordinates);
          const childTableRef = createChild(row, columns, childData, rowData.lastupdatedtime, true);
          tr.addClass('shown');
          $(this).html('<i class = "glyphicon glyphicon-minus-sign" style="text-align: center;cursor: pointer"> </i>');
          $(this).css({ 'text-align': 'center', cursor: 'pointer' });

          self.addClickHandler(childTableRef, columns, data);
        }
      }
    });
  }

  public renderMainData(tableId, childTable) {
    const tableColumns = [
      {
        title: '',
        className: 'details-control',
        createdCell: (td, cellData, rowData, row, col) => {
          if (rowData.placeName !== 'INDIA') {
            $(td).css({ 'text-align': 'center', cursor: 'pointer' });
            return '<i class = "glyphicon glyphicon-plus-sign"> </i>';
          }
        },
        data: null,
        render: (data, type, full, meta) => {
          if (full.placeName !== 'INDIA') {
            return '<i class = "glyphicon glyphicon-plus-sign" style="text-align: center;cursor: pointer"> </i>';
          } else {
            return '';
          }
        }
      },
      { title: 'Place', data: 'placeName' },
      { title: 'Active', data: 'active' },
      {
        title: 'Confirmed',
        data: 'confirmed',
        render: (data, type, full, meta) => {
          let html = '<div style="text-align: right;">';
          if (full.conFirmedToday && full.conFirmedToday > 0) {
            html += '<span style="color: red;">';
            html += '<i class="fa fa-arrow-circle-up">' + full.conFirmedToday + '</i>';
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
        data: 'deceased',
        render: (data, type, full, meta) => {
          let html = '<div style="text-align: right;">';
          if (full.deceasedToday && full.deceasedToday > 0) {
            html += '<span>';
            html += '<i class="fa fa-arrow-circle-up">' + full.deceasedToday + '</i>';
            html += ' </span><span>' + ' ' + full.deceased + '</span>';
            html += '</span>';
          } else {
            html += '<span>' + full.deceased + '</span>';
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
          if (full.recoveredToday && full.recoveredToday > 0) {
            html += '<span style="color: green;">';
            html += '<i class="fa fa-arrow-circle-up">' + full.recoveredToday + '</i>';
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

    let data = [{
      placeName: this.covidInfoPlace.placeName,
      active: this.covidInfoPlace.covidInfo.active,
      confirmed: this.covidInfoPlace.covidInfo.confirmed,
      deceased: this.covidInfoPlace.covidInfo.deceased,
      recovered: this.covidInfoPlace.covidInfo.recovered,
      conFirmedToday: this.covidInfoPlace.covidInfo.conFirmedToday,
      activeToday: this.covidInfoPlace.covidInfo.activeToday,
      deceasedToday: this.covidInfoPlace.covidInfo.deceasedToday,
      recoveredToday: this.covidInfoPlace.covidInfo.recoveredToday,
      subordinates: this.covidInfoPlace.subordinates ? this.covidInfoPlace.subordinates : []
    }];
    const subordinates = this.covidInfoPlace.subordinates ? this.covidInfoPlace.subordinates : [];
    if (subordinates) {
      const result = this.getSelfData(subordinates);
      data = [...data, ...result];
    }

    const tableRef = renderTable(this, tableId, tableColumns, data, false);

    if (childTable) {
      const childTableColumns = [...tableColumns];
      this.addClickHandler(tableRef, [...childTableColumns], data);
    }
  }
}



