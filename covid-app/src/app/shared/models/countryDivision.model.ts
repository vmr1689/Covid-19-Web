export interface CountryDivision {
    country: string;
    code: string;
    divisions: Divisions[];
}

export interface Divisions {
    code: string;
    name: string;
}
