import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { LocationService } from '../shared/services';
import { Location, ngBootstrapTable } from '../shared/models';

declare var $;



@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent implements OnInit {

  public locations: Location[] = [];
  publiclocationTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
  constructor(
    private router: Router,
    private locationService: LocationService) { }

  ngOnInit(): void {
    this.getAllLocations();
  }

  getAllLocations() {
    this.locationService.getAllLocations().subscribe((response: Location[]) => {
      this.locations = [];
      if (response && response.length > 0) {
        this.locations = response;
      }
    });
  }

  onSort({column, direction}: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const locations = [...this.locations];
    if (direction === '' || column === '') {
      this.locations = locations;
    } else {
      this.locations = [...locations].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  openCreateLocation() {
    this.router.navigate(['/addlocation']);
  }

  editLocation(placeId) {
    this.router.navigate(['/editlocation/' + placeId]);
  }

  ShowDeletedRecords() {

  }
}

