import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {

    @IsOptional()
    @IsString()
    first_name?: string;
    
    @IsOptional()
    @IsString()
    last_name?: string;
    
    @IsOptional()
    @IsString()
    email?: string;
    
    @IsString()
    @IsOptional()
    bio?: string;
}
