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

export function _restructureData(response: Location) {
    const resCopy = { ...response };
    let result: Location[] = [];
    resCopy.istarget = resCopy.type == 'Country';
    result.push(resCopy);

    if (Array.isArray(response.subordinates)) {
        result = result.concat(_flatData(response.subordinates, response, response.country));
    }
    let locations = [...result];
    locations = locations.sort((a, b) => a.placeName < b.placeName ? -1 : a.placeName > b.placeName ? 1 : 0);
    return locations;
}

export function _flatData(subordinates: Location[], root: Location, country: string) {
    let result: Location[] = [];

    const subor = [...subordinates];
    subor.forEach((sub) => {
        const subCopy = { ...sub };
        subCopy.root = root;
        subCopy.rootId = root.placeId;
        subCopy.country = country;
        result.push(subCopy);
        if (Array.isArray(sub.subordinates)) {
            result = result.concat(_flatData(sub.subordinates, sub, sub.country));
        }
    });

    return result;
}

export function _searchTree(element: Location, placeId: number) {
    if (element.placeId == placeId) {
        return element;
    } else if (element.subordinates && element.subordinates.length > 0) {
        let i;
        let result = null;
        for (i = 0; result == null && i < element.subordinates.length; i++) {
            result = _searchTree(element.subordinates[i], placeId);
        }
        return result;
    }
    return null;
}

export function getPlaceLocations(element: Location, placeId: number) {
    const result = _searchTree(element, placeId);
    if (result) {
        const response = _restructureData(result);
        return response;
    }
    return null;
}

export function _searchTree_Name(element: Location, placeName: string) {
    if (element.placeName.trim().toLowerCase() == placeName.trim().toLowerCase()) {
        return element;
    } else if (element.subordinates && element.subordinates.length > 0) {
        let i;
        let result = null;
        for (i = 0; result == null && i < element.subordinates.length; i++) {
            result = _searchTree_Name(element.subordinates[i], placeName);
        }
        return result;
    }
    return null;
}

export function getPlaceLocations_Name(element: Location, placeName: string) {
    placeName = placeName.trim().toLowerCase();
    const result = _searchTree_Name(element, placeName);
    if (result) {
        return result;
    }
    return null;
}

export function getPlaceLocations_Name_WithChild(element: Location, placeName: string) {
    placeName = placeName.trim().toLowerCase();
    const result = _searchTree_Name(element, placeName);
    if (result) {
        const response = _restructureData(result);
        return response;
    }
    return null;
}

export function getLocationWithLevel(response: Location, level: number, country: string) {

    const result: Location[] = [];

    response.level = level;
    response.istarget = response.type == 'Country';
    response.country = country;

    if (Array.isArray(response.subordinates)) {
        let i = 0;
        for (i = 0; i < response.subordinates.length; i++) {
            getLocationWithLevel(response.subordinates[i], response.level + 1, response.country);
        }
    }
    return response;
}
