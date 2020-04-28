export interface QuarantinedPerson {
    quaratinedId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    street: string;
    city: string;
    state: string;
    country: string;
    quaratinedDate: Date;
    quaratinedDateStr: string;
    remainingDays: string;
    age: string;
    address: string;
    status: string;
    rowColor?: string;
}