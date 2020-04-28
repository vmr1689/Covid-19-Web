import * as moment from 'moment';
import { Location } from '../models';

declare var $;

export function renderTable(self, tableId, tableColumns, tableData, childTable = false) {
    self = this;
    const table = $('#' + tableId + '').DataTable({
        data: tableData,
        columns: tableColumns,
        select: {
            style: (childTable ? 'os' : ''),
            selector: (childTable ? 'td:not(:first-child)' : '')
        },
    });
    return table;
}

export function destroyChild(row) {
    const table = $('table', row.child());
    table.detach();
    table.DataTable().destroy();
    row.child.hide();
}

export function createChild(row, tableColumns, tableData, lastupdatedtime, childTable = false, tableLength = 10) {
    const table = $('<table class=" table table-bordered table-hover display"/>');
    row.child(table).show();
    return table.DataTable({
        dom: '<"toolbar">frtip',
        fnInitComplete: () => {
            if (lastupdatedtime) {
                $('div.toolbar').html('<span style="float:left">' + lastupdatedtime + '</span>');
            }
        },
        pageLength: tableLength,
        data: tableData,
        columns: tableColumns,
        select: {
            style: (childTable ? 'os' : ''),
            selector: (childTable ? 'td:not(:first-child)' : '')
        },
    });
}

export const dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
    order: ['9']
};

export function convertDate(date: Date) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
}

export function getTimeStampFromDate(date: Date) {
    return moment(date).format('X');
}

export function getDateFromTimeStamp(timestamp: any) {
    return moment(timestamp, 'X').format('DD/MM/YYYY HH:mm:ss');
}

export function getDateFromDateStr(dateStr: any) {
    return moment(dateStr, 'DD/MM/YYYY HH:mm:ss').toDate();
}

export function restructureData(response: Location) {
    const resCopy = { ...response };
    let result: Location[] = [];
    resCopy.istarget = resCopy.type == 'Country';
    result.push(resCopy);

    if (Array.isArray(response.subordinates)) {
      result = result.concat(this.flatData(response.subordinates, response));
    }
    let locations = [...result];
    locations = locations.sort((a, b) => a.placeName < b.placeName ? -1 : a.placeName > b.placeName ? 1 : 0);
    return locations;
}

export function flatData(subordinates: Location[], root: Location) {
    let result: Location[] = [];

    const subor = [...subordinates];
    subor.forEach((sub) => {
      const subCopy = { ...sub };
      subCopy.root = root;
      subCopy.rootId = root.placeId;
      result.push(subCopy);
      if (Array.isArray(sub.subordinates)) {
        result = result.concat(this.flatData(sub.subordinates, sub));
      }
    });

    return result;
}
