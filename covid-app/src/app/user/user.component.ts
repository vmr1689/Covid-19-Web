import { Component, OnInit, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { SortEvent, NgbdSortableHeader, compare } from '../shared/directives/sortable.directive';

import { UserService } from '../shared/services';
import { User, ngBootstrapTable } from '../shared/models';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public model: User = {} as User;
  public roles = [
    {
      id: 'SuperAdmin', value: 'Super Admin'
    },
    {
      id: 'Level1', value: 'Level One'
    },
    {
      id: 'Level2', value: 'Level Two'
    }
  ];
  public users: User[] = [];
  public userTable: ngBootstrapTable;
  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.userService.getAll().subscribe((response: User[]) => {
      this.users = [];
      debugger;
      if (response && response.length > 0) {
        this.users = response;
      }
    });
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
    this.model = {} as User;
    $('#addUser').modal('toggle');
  }

  openEditUser(data: User) {
    this.model = { ...data };
    $('#editUser').modal('toggle');
  }

  openDeleteUser(data: User) {
    this.model = { ...data };
    $('#deleteUser').modal('toggle');
  }

  addUser(form: NgForm) {
    this.userService.register(this.model).subscribe((response: any) => {
      $('#addUser').modal('toggle');
    });
  }

  editUser(form: NgForm) {
    this.userService.updateUser(this.model.id, this.model).subscribe((response: any) => {
      $('#editUser').modal('toggle');
    });
  }

  deleteUser(data: User) {
    this.userService.delete(this.model.id).subscribe((response: any) => {
      $('#deleteUser').modal('toggle');
    });
  }
}


