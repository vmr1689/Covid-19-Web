export interface Organisation {
    covidOrganizationId: number;
    category: string;
    categoryId: string;
    organizationName: string;
    latitude: number;
    longitude: number;
    contactUrl?: string;
    phoneNumber: string[];
    state: string;
    district: string;
    city: string;
    country: string;
    profilePic?: any;
    description?: string;
}
