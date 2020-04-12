export interface SampleWebData {
    factoids: FactoidData[];
    faq: Faq[];
}

export interface FactoidData {
    banner: string;
    id: string;
}

export interface Faq {
    answer: string;
    qno: string;
    question: string;
}
