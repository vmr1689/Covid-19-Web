export interface Location {
    placeId: number;
    placeName: string;
    latitude: number;
    longitude: number;
    istarget?: boolean;
    rootId?: number;
    root?: Location;
}
