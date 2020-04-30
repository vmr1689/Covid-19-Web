import { Location} from './location.model';


export interface Patient {
    id: string;
    patientId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    city: string;
    state: string;
    country: string;
    age: string;
    address: string;
    status: string;
    rowColor?: string;
    statusUpdatedDate?: string;
    remainingDays?: string;
    quaratinedDate?: string;
    quaratinedDateStr?: string;
    type?: string;
}
