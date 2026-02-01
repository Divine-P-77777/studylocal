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

    // roomId format: tutorId-studentAuth0Id (where | in auth0Id is replaced by _)
    const parts = roomId.split('-');

    // Basic format validation
    if (parts.length < 2) {
        return notFound();
    }

    const roomTutorId = parts[0];
    // The rest is the student ID (re-join in case of extra hyphens, though unlikely for auth0 ids)
    const roomStudentIdEncoded = roomId.substring(roomTutorId.length + 1);
    const roomStudentId = roomStudentIdEncoded.replace(/_/g, '|');

    // --- SECURITY CHECK ---
    // User must be either the Student OR the Tutor of this room.

    let isAuthorized = false;

    // 1. Am I the Student?
    if (currentUserId === roomStudentId) {
        isAuthorized = true;
    }
    // 2. Am I the Tutor?
    else {
        if (currentUserId) {
            // We need to check if the current user owns the profile 'roomTutorId'.
            // We can do this efficiently by fetching the tutor profile for the *current user* 
            // and checking if its ID matches the roomTutorId.
            const { getTutorByAuth0Id } = await import('@/lib/actions/search');
            const myTutorProfile = await getTutorByAuth0Id(currentUserId);

            if (myTutorProfile && myTutorProfile._id.toString() === roomTutorId) {
                isAuthorized = true;
            }
        }
    }

    if (!isAuthorized) {
        // Log unauthorized access attempt if needed
        console.warn(`Unauthorized chat access attempt. User: ${currentUserId}, Room: ${roomId}`);
        const { redirect } = await import('next/navigation');
        return redirect('/');
    }
    // --- END SECURITY CHECK ---

    let chatTitle = 'Chat';
    let chatImage = '';

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

    // If I am Tutor, the other is Student
    if (tutorProfile && tutorProfile.auth0Id === currentUserId) {
        chatRole = 'Student';
    } else {
        // If I am Student, the other is Tutor
        chatRole = 'Tutor';
    }

    // Fetch my own details to pass to ChatPanel
    const { getUser } = await import('@/lib/actions/user');
    let dbUser = null;
    if (currentUserId) {
        dbUser = await getUser(currentUserId);
    }

    return (
        <div className="h-screen w-full">
            <ChatPanel
                roomId={roomId}
                title={chatTitle}
                userRole={chatRole}
                initialMessages={initialMessages}
                currentUser={dbUser}
            />
        </div>
    );
}
