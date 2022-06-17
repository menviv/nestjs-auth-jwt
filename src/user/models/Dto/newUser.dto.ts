import { LoginUserDto } from "./loginUser.dto";
import { IsString } from "class-validator";

export class NewUserDto extends LoginUserDto {

  @IsString()
  name: string;

}