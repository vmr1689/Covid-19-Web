import { FormControl } from '@angular/forms';

export class ngBootstrapTable {
    constructor() {
        this.page = 1;
        this.pageSize = 50;
        this.collectionSize = 0;
        this.filter = new FormControl();
    }
    page: number;
    pageSize: number;
    collectionSize: number;
    filter: FormControl;
}
