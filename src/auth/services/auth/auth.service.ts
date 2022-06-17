import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Observable, from } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { UserI } from "../../../user/models/user.interface";


@Injectable()
export class AuthService {

  constructor(private readonly jwtService: JwtService) {
  }

  generateJwt(user: UserI): Observable<string> {
    return from(this.jwtService.signAsync({user}))
  }

  hashPassword(password : string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }

  comparePassword(password: string, storedPasswordHash: string): Observable<any> {
    return from<string>(bcrypt.compare(password, storedPasswordHash));
  }

}
