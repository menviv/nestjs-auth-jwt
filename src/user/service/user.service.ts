import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, switchMap } from "rxjs";
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';
import { NewUserDto } from "../models/Dto/newUser.dto";
import { AuthService } from "../../auth/services/auth/auth.service";
import { LoginUserDto } from "../models/Dto/loginUser.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) {}

    create(newUserDto: NewUserDto): Observable<UserI> {
        //return from(this.userRepository.save(user));
        return this.mailExists(newUserDto.email).pipe(
          switchMap((exists: boolean) => {
              if(!exists) {
                  return this.authService.hashPassword(newUserDto.password).pipe(
                    switchMap((passwordHash: string) => {
                        newUserDto.password = passwordHash;
                        return from(this.userRepository.save(newUserDto)).pipe(
                          map((savedUser: UserI) => {
                              const {password, ...user} = savedUser;
                              return user;
                          })
                        )
                    })
                  )
              } else {
                  throw new HttpException('Email already in use', HttpStatus.CONFLICT);
              }
          })
        )
    }


    login(loginUserDto: LoginUserDto): Observable<string> {
      return this.findUserBEmail(loginUserDto.email).pipe(
        switchMap((user: UserI) => {
          if (user) {
            return this.validatePassword(loginUserDto.password, user.password).pipe(
              switchMap((passwordMatches: boolean) => {
                if (passwordMatches) {
                  return this.findOne(user.id).pipe(
                    switchMap((user: UserI) => this.authService.generateJwt(user))
                  )
                }
              })
            )
          } else {
            throw new HttpException('Login was not successful', HttpStatus.UNAUTHORIZED);
          }
        })
      )
    }



    findAll(): Observable<UserI[]> {
        return from(this.userRepository.find());
    }

    findOne(id: number): Observable<UserI> {
      return from(this.userRepository.findOne({where: {id}}));
    }

    private findUserBEmail(email: string): Observable<UserI> {
        return from(this.userRepository.findOne({
            select: ['id', 'name', 'password', 'email'],
            where: {email}
        }));
    }

    private validatePassword(password: string, storedPasswordHash: string): Observable<boolean> {
        return this.authService.comparePassword(password, storedPasswordHash)
    }

    private mailExists(email: string): Observable<boolean> {
        return from(this.userRepository.findOne({where: {email}})).pipe(
          map((user: UserI) => {
            return !!user;
          })
        )
    }


}
