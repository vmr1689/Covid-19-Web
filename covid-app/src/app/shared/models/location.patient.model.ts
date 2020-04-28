export interface LocationPatient {
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
    placeId?: number;
    placeName?: string;
    confirmed?: boolean;
    active?: boolean;
    recovered?: boolean;
    deceased?: boolean;
    quarantined?: boolean;
    gender: string;
}
