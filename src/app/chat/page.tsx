import { auth0 } from '@/lib/auth0';
import dbConnect from '@/lib/db/connect';
import Message from '@/lib/models/Message';
import TutorProfile from '@/lib/models/TutorProfile';
import Link from 'next/link';
import { MessageCircle, User } from 'lucide-react';
import { getTutorByAuth0Id } from '@/lib/actions/search';

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

    const searchConditions: any[] = [
        { senderId: userId },
        { roomId: { $regex: userId.replace(/\|/g, '_') } },
        { senderId: { $regex: userId } }
    ];

    if (tutorProfile) {
        // If user is a tutor, also look for rooms starting with their Tutor ID
        searchConditions.push({ roomId: { $regex: `^${tutorProfile._id}-` } });
    }

    const relevantRooms = await Message.distinct('roomId', {
        $or: searchConditions
    });

    const chats = [];

    for (const roomId of relevantRooms) {
        // Find latest message
        const lastMsg = await Message.findOne({ roomId }).sort({ timestamp: -1 }).lean();
        if (!lastMsg) continue;

        chats.push({
            roomId,
            lastMessage: lastMsg.message,
            timestamp: lastMsg.timestamp,
            // placeholder name until we fetch profile
            name: `Chat Room`
        });
    }

    // Sort by latest
    chats.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Custom Header for Chat List */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm flex items-center justify-between shrink-0">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <span className="font-bold text-xl">Messages</span>
                </Link>
                <Link href="/tutors" className="text-sm font-medium text-green-600 hover:text-green-700">
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
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition cursor-pointer flex gap-4 group">
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center text-green-600 font-bold text-lg">
                                        {(chat.name[0] || 'C').toUpperCase()}
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
