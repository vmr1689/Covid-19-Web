export interface QuarantinedReference {
    referenceId: string;
    placeName: string;
    person: string;
    phoneNumber: string;
    status: string;
    severity: string;
    dateStr: string;
    reason: string;
    date?: Date;
}
