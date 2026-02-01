export interface TutorFilterParams {
    subject?: string;
    classRange?: string;
    area?: string;
}

export function buildTutorQuery(params: TutorFilterParams) {
    const query: any = { marketingStatus: 'approved' };

    if (params.subject) {
        query.subjects = { $in: [new RegExp(params.subject, 'i')] };
    }

    if (params.classRange) {
        query.classRange = params.classRange;
    }

    if (params.area) {
        query.area = { $regex: params.area, $options: 'i' };
    }

    return query;
}
