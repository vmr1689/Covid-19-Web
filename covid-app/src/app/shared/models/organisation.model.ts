export interface Organisation {
    id: number;
    category: string;
    categoryId: number;
    name: string;
    latitude: number;
    longitude: number;
    contact?: string;
    phoneNumber: string[];
    state: string;
    district: string;
    city: string;
    country: string;
    profilePic?: any;
    description?: string;
}
