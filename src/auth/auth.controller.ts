import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import type { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  registerUser(@Body() createUserDto:CreateUserDto){
    return this.authService.create(createUserDto)
  }

  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto){
    return this.authService.login(loginUserDto)
  }

  @Get('check-status')
  @UseGuards(AuthGuard())
  checkStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user)
  }

  
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string,
    @Headers() headers: IncomingHttpHeaders
  ){

    // console.log({user:request.user})
    return {
      ok: true,
      message: 'Hola mundo',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin','super-user'])
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }
}
