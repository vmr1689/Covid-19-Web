import {SampleStateDistrictWiseData } from './sample_state-district-wise.model';

export class SampleData {
    casestimeseries: CasesTimeSeries[];
    statewise: StateWise[];
    tested: Tested[];
}

export class CasesTimeSeries {
    dailyconfirmed: string;
    dailydeceased: string;
    dailyrecovered: string;
    date: string;
    totalconfirmed: string;
    totaldeceased: string;
    totalrecovered: string;
}

export class StateWise {
    active: string;
    confirmed: string;
    deaths: string;
    deltaconfirmed: string;
    deltadeaths: string;
    deltarecovered: string;
    lastupdatedtime: string;
    recovered: string;
    state: string;
    statecode: string;
    district: SampleStateDistrictWiseData;
}

export class Tested {
    positivecasesfromsamplesreported: string;
    samplereportedtoday: string;
    source: string;
    testsconductedbyprivatelabs: string;
    totalindividualstested: string;
    totalpositivecases: string;
    totalsamplestested: string;
    updatetimestamp: string;
}

