import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bc from 'bcrypt';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto:CreateUserDto){
    try{
      const { password:regularPassword, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bc.hashSync(regularPassword, 10)
      });
      const savedUser = await this.userRepository.save(user);
      const { password:_, ...savedUserData } = savedUser;
      return {
        ...savedUserData,
        token: this.getJwtToken({id:savedUserData.id})
      }
    }catch(error){
      this.handleDBExceptions(error)
    }
  }

  async login(loginUserDto:LoginUserDto){
    try{
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: {email},
        select: { email: true, password:true, id:true }
      });
      if(!user) throw new UnauthorizedException('Credentials are not valid (email)');
      if (!bc.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)')
      return {
        ...user,
        token: this.getJwtToken({id: user.id})
      }
    }catch(error){
      throw error
    }
  }

  async checkAuthStatus(user:User){
    return {
      ...user,
      token: this.getJwtToken({id: user.id})
    }
  }

  private handleDBExceptions(error:any): never{
    if (error.code === '23505'){
        throw new BadRequestException(error.detail)
      }
      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected Error - Check Logs')
  }

  private getJwtToken(payload: JwtPayload){
    
    const token = this.jwtService.sign( payload );
    return token
  }


}
