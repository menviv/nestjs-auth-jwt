import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { runInThisContext } from 'vm';
import { UserI } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { NewUserDto } from "../models/Dto/newUser.dto";
import { LoginUserDto } from "../models/Dto/loginUser.dto";
import { JwtAuthGuard } from "../../auth/services/auth/guards/jwt-auth.guard";

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body() newUserDto: NewUserDto): Observable<UserI> {
        return this.userService.create(newUserDto);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginUserDto: LoginUserDto): Observable<Object> {
        return this.userService.login(loginUserDto).pipe(
          map((jwt: string) => {
              return {
                  access_token: jwt,
                  token_type: 'JWT',
                  expiresIn: 10000
              }
          })
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    findAll(@Req() request): Observable<UserI[]> {
        console.log(request.user);
        return this.userService.findAll();
    }


}
