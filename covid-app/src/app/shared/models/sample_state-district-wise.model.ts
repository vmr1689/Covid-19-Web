export class SampleStateDistrictWiseData {
    [index: string]: DistrictData;
}

export class DistrictData {
    districtData: District;
}

export class District {
    [index: string]: DistrictField;
}

export class DistrictField {
    confirmed: string;
    lastupdatedtime: string;
    delta: Delta;
}

export class Delta {
    confirmed: string;
}
