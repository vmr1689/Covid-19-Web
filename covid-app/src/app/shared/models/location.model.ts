export interface Location {
    placeId: number;
    placeName: string;
    latitude: number;
    longitude: number;
    istarget?: boolean;
    rootId?: number;
    root?: Location;
    type?: string;
    severity?: string;
    covidInfo?: CovidInfo;
    subordinates?: Location[];
    name?: string;
}

export interface CovidInfo {
    confirmed: number;
    active: number;
    recovered: number;
    deceased: number;
    conFirmedToday: number;
}
