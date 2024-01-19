import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import {
  CreateUserDto,
  PaginationDto,
  UpdateUserDto,
  User,
  Users,
} from '@app/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];

  onModuleInit() {
    for (let i = 0; i < 100; i++) {
      this.create({
        username: `user${i}`,
        password: `<PASSWORD>}`,
        age: i,
      });
    }
  }
  create(createUserDto: CreateUserDto): User {
    const user: User = {
      ...createUserDto,
      subscribed: true,
      id: randomUUID(),
      socialMedia: {},
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return { users: this.users };
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    let user = this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user = { ...user, ...updateUserDto };
    return user;
  }
  remove(id: string): User {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    return this.users.splice(index, 1)[0];
  }

  query(paginationDtoStream: Observable<PaginationDto>): Observable<Users> {
    const subject = new Subject<Users>();
    const onNext = (paginationDto: PaginationDto) => {
      const start = paginationDto.page * paginationDto.skip;
      subject.next({
        users: this.users.slice(start, start + paginationDto.skip),
      });
    };
    const onComplete = () => subject.complete();
    paginationDtoStream.subscribe(onNext, null, onComplete);
    return subject.asObservable();
  }
}
