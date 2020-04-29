export interface Location {
    placeId: number;
    placeName: string;
    latitude: number;
    longitude: number;
    type?: string;
    severity?: string;
    covidInfo?: CovidInfo;
    istarget?: boolean;
    rootId?: number;
    root?: Location;
    subordinates?: Location[];
    name?: string;
    country?: string;
}

export interface CovidInfo {
    confirmed: number;
    active: number;
    recovered: number;
    deceased: number;
    conFirmedToday: number;
    activeToday: number;
    recoveredToday: number;
    deceasedToday: number;
    maleCount: number;
    femaleCount: number;
    othersCount: number;
}
