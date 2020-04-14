import { Location} from './location.model';


export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    age: string;
    phone: string;
    email: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    zipcode: string;
    latitude: string;
    longitude: string;
    deviceName: string;
    deviceAddress: string;
    placeId: string;
    severity: string;
    place: Location;
}
