import { IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsString({ message: 'invalid verification token' })
  @Matches(/^(?:[\w-]*\.){2}[\w-]*$/, { message: 'invalid verification token' })
  verification_token: string;
}
