import { Component, OnInit, OnDestroy, QueryList, ViewChildren, AfterViewChecked, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UserService, SpinnerService } from '../shared/services';
import { User, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild(DataTableDirective, { static: false }) dtElement : DataTableDirective;
  public isDtInitialized = false;
  @ViewChild('addform') addForm: NgForm;
  @ViewChild('editForm') editForm: NgForm;

  public dtOptions: DataTables.Settings = {
    autoWidth: false,
    jQueryUI: true,
    dom: '<"pull-left"f><"pull-right"l>tip',
  };
  public dtTrigger = new Subject();

  public model: User = {} as User;
  public roles = [
    {
      id: 'SuperAdmin', value: 'Super Admin'
    },
    {
      id: 'Admin', value: 'Admin'
    },
  ];
  public users: User[] = [];
  public userTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngAfterViewChecked() {
    $('.dataTables_filter input, .dataTables_length select').addClass('form-control');
  }

  ngOnDestroy(): void {
    if (this.dtTrigger) {
      this.dtTrigger.unsubscribe();
    }
  }

  getAllUsers() {
    this.spinnerService.show();
    this.userService.getAll().subscribe((response: User[]) => {
      this.users = [];
      if (response && response.length > 0) {
        this.users = response;
        this.rerender();
      }
    }).add(() => {
      this.spinnerService.hide();
    });
  }

  rerender(): void {
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.isDtInitialized = true;
      this.dtTrigger.next();
    }
  }

  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    const users = [...this.users];
    if (direction === '' || column === '') {
      this.users = users;
    } else {
      this.users = [...users].sort((a, b) => {
        const res = compare(`${a[column]}`, `${b[column]}`);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  openCreateUser() {
    this.addForm.resetForm();
    this.model = {} as User;
    $('#addUser').modal('toggle');
  }

  openEditUser(data: User) {
    this.editForm.resetForm();
    this.model = { ...data };
    $('#editUser').modal('toggle');
  }

  openDeleteUser(data: User) {
    this.model = { ...data };
    $('#deleteUser').modal('toggle');
  }

  addUser(form: NgForm) {
    this.spinnerService.show();
    const model = { ...this.model };
    this.userService.register(model).subscribe((response: any) => {
      $('#addUser').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUsers();
    });
  }

  editUser(form: NgForm) {
    this.spinnerService.show();
    this.userService.updateUser(this.model.id, this.model).subscribe((response: any) => {
      $('#editUser').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUsers();
    });
  }

  deleteUser(data: User) {
    this.spinnerService.show();
    this.userService.delete(this.model.id).subscribe((response: any) => {
      $('#deleteUser').modal('toggle');
    }).add(() => {
      this.spinnerService.hide();
      this.getAllUsers();
    });
  }
}


