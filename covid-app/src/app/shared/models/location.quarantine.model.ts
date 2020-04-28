export interface LocationQuarantine {
    patientId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    country: string;
    state: string;
    city: string;
    age: number;
    address: string;
    status: string;
    gender: string;
    quaratinedDateStr: string;
    quaratinedDate: Date;
    placeId?: number;
    placeName?: string;
    confirmed?: boolean;
    active?: boolean;
    recovered?: boolean;
    deceased?: boolean;
    quarantined?: boolean;
}
