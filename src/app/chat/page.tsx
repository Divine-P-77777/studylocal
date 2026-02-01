import { auth0 } from '@/lib/auth0';
import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';
import TutorProfile from '@/lib/models/TutorProfile';
import Link from 'next/link';
import { MessageCircle, User } from 'lucide-react';
import { getTutorByAuth0Id } from '@/lib/actions/search';

// Helper to escape regex special characters
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function ChatListPage() {
    const session = await auth0.getSession();
    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Please Login</h1>
                    <p className="text-gray-500 mt-2">You need to be logged in to view your messages.</p>
                    <a href="/api/auth/login" className="mt-4 inline-block bg-brand-600 text-white px-6 py-2 rounded-lg">Login</a>
                </div>
            </div>
        );
    }

    const userId = session.user.sub;
    const tutorProfile = await getTutorByAuth0Id(userId);

    await dbConnect();

    // STRICTER SEARCH LOGIC
    const searchConditions: any[] = [
        // 1. I am the sender (Strict match - no regex needed for senderId)
        { senderId: userId },
    ];

    // 2. Exact match for Room ID where I am a participant
    const userIdClean = userId.replace(/\|/g, '_');
    const userIdEscaped = escapeRegExp(userIdClean);

    // Case A: I am the STUDENT.
    // Room ID ends with `-${userIdEscaped}` essentially.
    searchConditions.push({ roomId: { $regex: `-${userIdEscaped}$` } });

    if (tutorProfile) {
        // Case B: I am the TUTOR.
        // Room ID starts with `${tutorProfile._id}-`
        searchConditions.push({ roomId: { $regex: `^${tutorProfile._id}-` } });
    }

    const relevantRooms = await Message.distinct('roomId', {
        $or: searchConditions
    });

    const chats = [];

    const { getTutorById } = await import('@/lib/actions/search');
    const { getUser } = await import('@/lib/actions/user');

    // Import ArrowLeft for UI
    const { ArrowLeft } = await import('lucide-react');

    for (const roomId of relevantRooms) {
        // Find latest message
        const lastMsg = await Message.findOne({ roomId }).sort({ timestamp: -1 }).lean();
        if (!lastMsg) continue;

        // Determine who the other person is
        const parts = roomId.split('-');
        if (parts.length < 2) continue; // Skip invalid rooms

        const roomTutorId = parts[0];
        const roomStudentIdEncoded = roomId.substring(roomTutorId.length + 1);
        const roomStudentId = roomStudentIdEncoded.replace(/_/g, '|');

        let name = 'Chat Room';
        let photoUrl = '';

        // POST-FILTERING SECURITY CHECK
        // Even if DB query returned this room, verifying we are truly a participant.

        let isParticipant = false;

        // If I am the Tutor of this room
        if (tutorProfile && tutorProfile._id.toString() === roomTutorId) {
            isParticipant = true;
            const student = await getUser(roomStudentId);
            name = student?.fullName || 'Student';
            photoUrl = student?.photoUrl || '';
        }
        // If I am the Student of this room (Match my ID)
        else if (roomStudentId === userId) {
            isParticipant = true;
            const tutor = await getTutorById(roomTutorId);
            name = tutor?.fullName || 'Tutor';
            photoUrl = tutor?.photoUrl || '';
        }

        // If I sent the last message but am not strictly the Tutor or Student of the room definition
        // (e.g. edge case or data migration issues), we should theoretically allow seeing it IF I sent it.
        // But for strict "New Tutor" safety, we enforce role. 
        // If I sent it, senderId would match my userId.
        if (!isParticipant && lastMsg.senderId === userId) {
            // I sent the message, so I should see it?
            // If the system works correctly, I can ONLY send messages to rooms I'm part of.
            // But if there was a leak before, I might have sent a message to a random room?
            // Let's hide it to be safe for now if the user explicitly wants "new tutor shouldn't see".

            // However, "Sender" should generally see their own sent messages. 
            // But the user issue is "New Tutor seeing threads they shouldn't".
            // A new tutor wouldn't have SENT messages to those threads. 
            // So !isParticipant should filter them out.
        }

        if (isParticipant) {
            chats.push({
                roomId,
                lastMessage: lastMsg.message,
                timestamp: lastMsg.timestamp,
                name,
                photoUrl,
                senderId: lastMsg.senderId
            });
        }
    }

    // Sort by latest
    chats.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Custom Header with Gradient and Back Button */}
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-4 shadow-md flex items-center justify-between shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-1 hover:bg-white/20 rounded-full transition">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="font-bold text-xl">Messages</h1>
                </div>
                <Link href="/tutors" className="text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition backdrop-blur-sm">
                    Find Tutors
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto space-y-3">
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                                <MessageCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900">No messages yet</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4">Connect with a tutor to start chatting.</p>
                            <Link href="/tutors" className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition shadow-sm">
                                Find a Tutor
                            </Link>
                        </div>
                    ) : (
                        chats.map(chat => (
                            <Link key={chat.roomId} href={`/chat/${chat.roomId}`}>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition cursor-pointer flex gap-4 group hover:shadow-md">
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-600 font-bold text-lg overflow-hidden relative border border-green-50">
                                        {chat.photoUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={chat.photoUrl} alt={chat.name} className="h-full w-full object-cover" />
                                        ) : (
                                            (chat.name[0] || 'C').toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.name}</h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(chat.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition">
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
