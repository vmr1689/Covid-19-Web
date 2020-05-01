export class User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    token?: string;
    phoneNumber?: string;
    isEmailConfirmed?: string;
    role?: string;
    status: boolean;
    hospitalId?: string;
    hospitalAddress?: string;
    hospitalName?: string;
    profilePic?: any;
    placeId?: any;
    placeName?: string;
}
