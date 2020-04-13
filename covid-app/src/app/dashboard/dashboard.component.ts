import { Component, OnInit, NgZone, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_indiaLow from '@amcharts/amcharts4-geodata/indiaLow';
import * as moment from 'moment';

import { Countries, Continents } from '../../environments/environment';
import { renderTable, createChild, destroyChild } from '../shared/helpers';
import { DashboardService } from '../shared/services';
import {
  Updates,
  SampleData,
  SampleStateDistrictWiseData,
  SampleUpdatesData,
  SampleWebData,
  CasesTimeSeries,
  StateWise
} from '../shared/models';

declare var $;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  public bannerList: SampleWebData;
  public infoIndex = 0;
  public info: string;

  public sampleData: SampleData;
  public sampleStateDistrictData: SampleStateDistrictWiseData;
  public updatesList: Updates[] = [];
  public dailySpreadList: CasesTimeSeries[] = [];

  public mapchart: am4maps.MapChart;

  constructor(
    private zone: NgZone,
    private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getStateDistrictData();
    this.getBannerData();
    this.getUpdatesData();
    this.getDetails();
  }

  public getStateDistrictData() {
    this.dashboardService.getStateDistrictData().subscribe((response: SampleStateDistrictWiseData) => {
      if (response) {
        this.sampleStateDistrictData = response;
        console.log(this.sampleStateDistrictData);
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

      //World map
      const countries = Countries;
      const continents = Continents;


      var ranges = [
        {
          label: '1-272',
          color: '#rgb(255, 245, 240)',
          percent: 30,
          data: [{
            state: 'Maharashtra',
            statecode: 'MH'
          }]
        },
        {
          label: '273-544',
          color: '#rgb(253, 213, 195)',
          percent: 40,
          data: [{
            state: '',
            statecode: ''
          }]
        },
        {
          label: '545-816',
          color: '#rgb(252, 165, 136)',
          percent: 50,
          data: [{
            state: '',
            statecode: ''
          }]
        },
        {
          label: '817-1088',
          color: '#rgb(250, 113, 82)',
          percent: 60,
          data: [{
            state: '',
            statecode: ''
          }]
        },
        {
          label: '1089-1360',
          color: '#rgb(233, 57, 45)',
          percent: 70,
          data: [{
            state: '',
            statecode: ''
          }]
        },
        {
          label: '1360+',
          color: '#rgb(189, 22, 26)',
          percent: 80,
          data: [{
            state: '',
            statecode: ''
          }]
        }
      ];



      const mapchart = am4core.create('chartdiv', am4maps.MapChart);
      mapchart.responsive.enabled = true;
      mapchart.projection = new am4maps.projections.Miller();


      // Create map polygon series for world map
      const indiaSeries = mapchart.series.push(new am4maps.MapPolygonSeries());
      indiaSeries.useGeodata = true;
      indiaSeries.geodata = am4geodata_indiaLow;
      //worldSeries.exclude = ["AQ"];

      // Configure series
      let polygonTemplate = indiaSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}";
      polygonTemplate.fill = am4core.color("#74B266");

      // Create hover state and set alternative fill color
      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#367B25");

      // worldSeries.data = [{
      //   "id": "US",
      //   "name": "United States",
      //   "value": 100,
      //   "fill": am4core.color("#F05C5C")
      // }, {
      //   "id": "FR",
      //   "name": "France",
      //   "value": 50,
      //   "fill": am4core.color("#5C5CFF")
      // }];
      // polygonTemplate.propertyFields.fill = "fill";
      // const worldPolygon = worldSeries.mapPolygons.template;
      // worldPolygon.tooltipText = "Region: {name}" + "\n" + "Active: {active}";
      // worldPolygon.nonScalingStroke = true;
      // worldPolygon.strokeOpacity = 0.5;
      // worldPolygon.fill = am4core.color("#eee");
      // worldPolygon.propertyFields.fill = "color";

      // let hs1 = worldPolygon.states.create("hover");
      // hs1.properties.fill = mapchart.colors.getIndex(9);

      // // Create country specific series (but hide it for now)
      // let countrySeries = mapchart.series.push(new am4maps.MapPolygonSeries());
      // countrySeries.useGeodata = true;
      // countrySeries.hide();
      // countrySeries.geodataSource.events.on("done", function(ev) {
      //   //worldSeries.hide();
      //   countrySeries.show();
      // });

      // let countryPolygon = countrySeries.mapPolygons.template;
      // countryPolygon.tooltipText = "Region: {name}";
      // countryPolygon.nonScalingStroke = true;
      // countryPolygon.strokeOpacity = 0.5;
      // countryPolygon.fill = am4core.color("#eee");

      // let hs2 = countryPolygon.states.create("hover");
      // hs2.properties.fill = mapchart.colors.getIndex(9);

      // // Set up click events
      // worldPolygon.events.on("hit", function(ev) {
      //   ev.target.series.chart.zoomToMapObject(ev.target);
      //   let map = ev.target.dataItem.dataContext["map"];

      //   if (map) {
      //     ev.target.isHover = false;
      //     countrySeries.geodataSource.url =
      //       "https://www.amcharts.com/lib/4/geodata/json/" + map + ".json";
      //     countrySeries.geodataSource.load();
      //   }
      // });

      // //Set up data for countries
      // let mapdata = [];
      // for (var id in countries) {
      //   if (countries.hasOwnProperty(id)) {
      //     let country = countries[id];
      //     if (country.maps.length) {
      //       mapdata.push({
      //         id: id,
      //         color: mapchart.colors.getIndex(
      //           continents[country.continent_code]
      //         ),
      //         map: country.maps[0]
      //       });
      //     }
      //   }
      // }
      // worldSeries.data = mapdata;

      // Zoom control
      mapchart.zoomControl = new am4maps.ZoomControl();

      let homeButton = new am4core.Button();
      homeButton.events.on("hit", function () {
        // worldSeries.show();
        // countrySeries.hide();
        mapchart.goHome();
      });

      homeButton.icon = new am4core.Sprite();
      homeButton.padding(7, 5, 7, 5);
      homeButton.width = 30;
      homeButton.icon.path =
        "M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8";
      homeButton.marginBottom = 10;
      homeButton.parent = mapchart.zoomControl;
      homeButton.insertBefore(mapchart.zoomControl.plusButton);

      // //create capital markers
      // let imageSeries = mapchart.series.push(new am4maps.MapImageSeries());
      // let targetSVG =
      //   "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";
      // // define template
      // let imageSeriesTemplate = imageSeries.mapImages.template;
      // let circle = imageSeriesTemplate.createChild(am4core.Sprite);
      // circle.scale = 0.4;
      // circle.fill = new am4core.InterfaceColorSet().getFor(
      //   "alternativeBackground"
      // );
      // circle.path = targetSVG;
      // // what about scale...

      // // set propertyfields
      // imageSeriesTemplate.propertyFields.latitude = "latitude";
      // imageSeriesTemplate.propertyFields.longitude = "longitude";

      // imageSeriesTemplate.horizontalCenter = "middle";
      // imageSeriesTemplate.verticalCenter = "middle";
      // imageSeriesTemplate.align = "center";
      // imageSeriesTemplate.valign = "middle";
      // imageSeriesTemplate.width = 8;
      // imageSeriesTemplate.height = 8;
      // imageSeriesTemplate.nonScaling = true;
      // imageSeriesTemplate.tooltipText =
      //   "Region: {title}" +
      //   "\n" +
      //   "Active: {active}" +
      //   "\n" +
      //   "In-active: {inactive}" +
      //   "\n" +
      //   "Healthy: {healthy}";
      // imageSeriesTemplate.fill = am4core.color("#000");
      // imageSeriesTemplate.background.fillOpacity = 0;
      // imageSeriesTemplate.background.fill = am4core.color("#ffffff");
      // imageSeriesTemplate.setStateOnChildren = true;
      // imageSeriesTemplate.states.create("hover");
      // imageSeriesTemplate.events.on("hit", ev => {
      //   console.log(ev.target.dataItem.dataContext);

      //   debugger;
      //   ev.target.series.chart.zoomToMapObject(ev.target);

      //   let map = ev.target.dataItem.dataContext["map"];

      //   if (map) {
      //     ev.target.isHover = false;
      //     countrySeries.geodataSource.url =
      //       "https://www.amcharts.com/lib/4/geodata/json/" + map + ".json";
      //     countrySeries.geodataSource.load();
      //   }
      // });
      this.mapchart = mapchart;
      this.renderDailyCharts();
    });
  }

  public renderDailyCharts() {
    // Confirmed Chart
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
    categoryAxis.renderer.labels.template.adapter.add('dx', function (dx, target) {
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




    // Recovered chart
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
    recoveredCategoryAxis.renderer.labels.template.adapter.add("dx", function (dx, target) {
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




    // Deceased Chart
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
    deceasedCategoryAxis.renderer.labels.template.adapter.add('dx', function (dx, target) {
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

  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.mapchart) {
        this.mapchart.dispose();
      }
    });
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



