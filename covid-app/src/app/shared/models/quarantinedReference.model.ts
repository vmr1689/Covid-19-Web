export interface QuarantinedReference {
    referenceId: string;
    placeName: string;
    person: string;
    phoneNumber: string;
    status: string;
    severity: string;
    primaryAddress: string;
    secondaryAddress: string;
    familyCount: number;
    patientId: string;
    dateStr: string;
    reason: string;
    date?: Date;
}
