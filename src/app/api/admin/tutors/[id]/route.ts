import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import TutorProfile from '@/lib/models/TutorProfile';
import { auth0 } from '@/lib/auth0';

import { ADMIN_EMAILS } from '@/lib/constants';

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth0.getSession();
        if (!session || !session.user || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { status } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();

        const updatedTutor = await TutorProfile.findByIdAndUpdate(
            id,
            { marketingStatus: status },
            { new: true }
        );

        if (!updatedTutor) {
            return NextResponse.json({ message: 'Tutor not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, tutor: updatedTutor });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
