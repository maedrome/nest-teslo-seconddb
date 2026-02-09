import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user
        const value = req.user[data]
        if(!user)
            throw new InternalServerErrorException('User not found (request)')
        return (!value) ? user : value
        
    }
)