import * as moment from 'moment';
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

