import ChatPanel from '@/components/chat/ChatPanel';
import { auth0 } from '@/lib/auth0';
import { getTutorById } from '@/lib/actions/search';
import { getMessages } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';

export default async function ChatPage(props: { params: Promise<{ roomId: string }> }) {
    const params = await props.params;
    const roomId = params.roomId;

    const session = await auth0.getSession();
    const currentUserId = session?.user?.sub;

    // roomId format: tutorId-studentAuth0Id (where | is replaced by _)
    // We need to carefully split because studentAuth0Id might contain hyphens? 
    // Actually standard auth0|something turns to auth0_something. 
    // But tutorId is a mongoId (first part).
    const parts = roomId.split('-');
    const roomTutorId = parts[0];
    // The rest is the student ID, possibly rejoined if it had hyphens, though usually auth0 IDs don't have hyphens except as separators? 
    // Safest is to slice.
    const roomStudentIdEncoded = roomId.substring(roomTutorId.length + 1);
    const roomStudentId = roomStudentIdEncoded.replace(/_/g, '|');

    let chatTitle = 'Chat';
    let chatImage = '';

    // If I am the tutor, I want to see the Student
    // Note: We need to know my own ID. 
    // However, roomTutorId is the Service Profile ID (TutorProfile._id), not Auth0 ID.
    // So we can't directly compare currentUserId (Auth0) with roomTutorId (Mongo).
    // But we can check if the current user *is* that tutor.

    // Simplification: Fetch both.
    const tutorProfile = await getTutorById(roomTutorId);

    if (tutorProfile && tutorProfile.auth0Id === currentUserId) {
        // I am the tutor, show Student Name
        const { getUser } = await import('@/lib/actions/user');
        const student = await getUser(roomStudentId);
        chatTitle = student?.fullName || 'Student';
        chatImage = student?.photoUrl || '';
    } else {
        // I am the student (or anonymous), show Tutor Name
        if (tutorProfile) {
            chatTitle = tutorProfile.fullName;
            chatImage = tutorProfile.photoUrl || '';
        }
    }

    const initialMessages = await getMessages(roomId);

    let chatRole = '';

    // Logic to determine role
    // If I am Tutor, the other is Student
    if (tutorProfile && tutorProfile.auth0Id === currentUserId) {
        chatRole = 'Student';
    } else {
        // If I am Student, the other is Tutor
        chatRole = 'Tutor';
    }

    return (
        <div className="h-screen w-full">
            <ChatPanel
                roomId={roomId}
                title={chatTitle}
                userRole={chatRole}
                initialMessages={initialMessages}
            />
        </div>
    );
}
