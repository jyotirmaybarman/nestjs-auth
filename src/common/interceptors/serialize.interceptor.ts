import { CallHandler, ExecutionContext, NestInterceptor, Injectable, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtPayload } from '../types/jwt-payload.type';


export function Serialize(dto: any){
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor{
  constructor(private dto: any){}
  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req: Request = context.switchToHttp().getRequest();
    const user: JwtPayload = req.user as JwtPayload;
    let role = "";
    if(user){
      role = user.role;
    }  
    
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          groups: [role]
        });
      })
    )
  }

}