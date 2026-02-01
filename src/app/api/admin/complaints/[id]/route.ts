import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Complaint from '@/lib/models/Complaint';
import { auth0 } from '@/lib/auth0';

const ADMIN_EMAILS = ['admin@studylocal.com', 'demo@admin.com'];

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

        // Validate status used for complaints
        if (!['open', 'resolved', 'in progress'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedComplaint) {
            return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, complaint: updatedComplaint });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
