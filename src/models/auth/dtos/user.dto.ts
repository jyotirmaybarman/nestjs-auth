import { Expose } from "class-transformer";

export class UserDto {
    
    @Expose()
    id: string;

    @Expose()
    first_name: string;
    
    @Expose()
    last_name: string;
    
    @Expose()
    email: string;
    
    @Expose()
    role: string;
    
    @Expose()
    avatar: string;
    
    @Expose()
    bio: string;

    @Expose({ groups: [ "ADMIN" ] })
    created_at: string;
    
    @Expose({ groups: [ "ADMIN" ] })
    updated_at: string;

}