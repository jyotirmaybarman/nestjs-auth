import { IsEmail, IsString } from "class-validator";

export class SendEmailDto {

    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    verification_link: string;
    
    @IsString()
    contact_email: string;
}