'use client';

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Send,
    Check,
    Trash2,
    Mic,
    Handshake,
} from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from 'react-toastify';
import { useChat } from '@/hooks/useChat';
import Image from 'next/image';
import {
    getEnrolmentForChat,
    createEnrolment,
    confirmEnrolment
} from '@/lib/actions/enrolment';


declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ChatPanelProps {
    roomId: string;
    title?: string;
    userRole?: string;
    initialMessages?: any[];
    currentUser?: any; // Added prop
}

export default function ChatPanel({
    roomId,
    title = 'Conversation',
    userRole,
    initialMessages = [],
    currentUser,
}: ChatPanelProps) {
    const { user, isLoading } = useUser();

    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isFirstLoad = useRef(true);

    const [enrolment, setEnrolment] = useState<any>(null);
    const [isEnrolling, setIsEnrolling] = useState(false);

    // Prefer DB user data, fallback to Auth0
    const userId = currentUser?.auth0Id ?? user?.sub ?? '';
    const userName = currentUser?.fullName ?? user?.name ?? user?.email ?? 'Anonymous';

    const hasSpeechSupport =
        typeof window !== 'undefined' &&
        (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

    const {
        messages,
        sendMessage,
        deleteMessage,
    } = useChat(roomId, userId, userName, initialMessages);

    /* Scroll to bottom reliably */
    useLayoutEffect(() => {
        if (!bottomRef.current) return;

        bottomRef.current.scrollIntoView({
            behavior: isFirstLoad.current ? 'auto' : 'smooth',
            block: 'end',
        });

        isFirstLoad.current = false;
    }, [messages.length]);

    const handleSend = () => {
        if (!user) {
            toast.error('You must be logged in to chat');
            return;
        }

        const msg = input.trim();
        if (!msg) return;

        if (msg.split(/\s+/).length > 300) {
            toast.error('Message too long (300 words max)');
            return;
        }

        sendMessage(msg);
        setInput('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this message?')) {
            deleteMessage(id);
        }
    };

    const toggleListening = () => {
        if (!hasSpeechSupport) {
            toast.error('Voice input not supported');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const Speech =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        const recognition = new Speech();
        recognition.lang = 'en-US';
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setInput((prev) => prev + ' ' + transcript);
        };

        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    useEffect(() => {
        const fetchEnrolment = async () => {
            if (!roomId || !userId) return;
            const parts = roomId.split('-');
            const roomTutorId = parts[0];
            const roomStudentId = roomId.substring(roomTutorId.length + 1).replace(/_/g, '|');

            const data = await getEnrolmentForChat(roomTutorId, roomStudentId);
            setEnrolment(data);
        };
        fetchEnrolment();
    }, [roomId, userId]);

    const handleEnrol = async () => {
        if (isEnrolling) return;
        setIsEnrolling(true);

        const parts = roomId.split('-');
        const roomTutorId = parts[0];
        const roomStudentId = roomId.substring(roomTutorId.length + 1).replace(/_/g, '|');

        try {
            if (!enrolment) {
                // Create pending deal
                const res = await createEnrolment(roomTutorId, roomStudentId);
                if (res.success) {
                    setEnrolment(res.enrolment);
                    sendMessage(`🤝 I've initiated a deal! Please confirm to finalize.`);
                    toast.success('Deal initiated!');
                } else {
                    toast.error(res.message || 'Failed to initiate deal');
                }
            } else if (enrolment.status === 'pending') {
                // Confirm deal
                const res = await confirmEnrolment(enrolment._id);
                if (res.success) {
                    setEnrolment(res.enrolment);
                    sendMessage(`✅ Deal Confirmed! We are now officially connected.`);
                    toast.success('Deal confirmed!');
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsEnrolling(false);
        }
    };

    /* Loading */
    if (isLoading) {
        return (
            <div className="flex h-[100dvh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
            </div>
        );
    }

    /* Not logged in */
    if (!user) {
        return (
            <div className="flex h-[100dvh] items-center justify-center bg-[#e5ddd5]">
                <div className="rounded-xl bg-white p-6 text-center shadow">
                    <p className="mb-4 text-gray-600">
                        Please log in to chat.
                    </p>
                    <a
                        href="/api/auth/login"
                        className="rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700 transition"
                    >
                        Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-white">
            {/* Fixed wallpaper */}
            <div className="fixed inset-0 -z-10">
                <Image
                    src="/chat-wallpaper.png"
                    alt="Chat background pattern"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
            </div>


            {/* Chat container */}
            <div className="relative z-10 flex h-full w-full justify-center">
                <div
                    className="
                        mx-auto flex h-full w-full max-w-3xl flex-col
                        bg-gradient-to-b from-green-50/80 to-green-100/90
                        backdrop-blur-sm
                        shadow-2xl
                        overflow-hidden
                    "
                >
                    {/* Header */}
                    <header className="flex items-center gap-3 border-b bg-[#f0f2f5] px-4 py-3">
                        <Link
                            href="/"
                            className="rounded-full p-2 hover:bg-gray-200 transition"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 font-medium">
                            {title.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium">
                                    {title}
                                </h3>
                                {userRole && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${userRole.toLowerCase() === 'tutor'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {userRole}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Online
                            </p>
                        </div>

                        {/* Deal Tracking Button */}
                        <div className="flex items-center gap-2">
                            {enrolment?.status === 'confirmed' ? (
                                <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                                    <Check className="h-3.5 w-3.5" />
                                    Deal Done
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnrol}
                                    disabled={isEnrolling}
                                    className={`
                                        flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition
                                        ${enrolment?.status === 'pending'
                                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }
                                        disabled:opacity-50
                                    `}
                                >
                                    <Handshake className="h-3.5 w-3.5" />
                                    {isEnrolling ? '...' : (enrolment?.status === 'pending' ? 'Confirm Deal' : 'Start Deal')}
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Messages */}
                    <main
                        className="
                            flex-1 min-h-0 overflow-y-auto
                            px-4 py-4
                            overscroll-contain
                        "
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="rounded bg-white px-4 py-2 text-sm shadow">
                                    🔒 Messages are end-to-end encrypted.
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {messages.map((msg, i) => {
                                    const isMe =
                                        msg.senderId === userId;
                                    const prev = messages[i - 1];
                                    const isSeq =
                                        prev?.senderId ===
                                        msg.senderId;

                                    return (
                                        <div
                                            key={msg._id ?? i}
                                            className={`flex ${isMe
                                                ? 'justify-end'
                                                : 'justify-start'
                                                } ${isSeq
                                                    ? 'mt-0.5'
                                                    : 'mt-2'
                                                }`}
                                        >
                                            <div
                                                className={`relative max-w-[75%] rounded-lg px-3 py-1.5 text-sm shadow
                                                ${isMe
                                                        ? 'bg-[#dcf8c6] rounded-tr-none'
                                                        : 'bg-white rounded-tl-none'
                                                    }`}
                                            >
                                                {!isMe &&
                                                    !isSeq && (
                                                        <p className="mb-0.5 text-xs font-semibold text-orange-800">
                                                            {
                                                                msg.senderName
                                                            }
                                                        </p>
                                                    )}

                                                <p className="whitespace-pre-wrap break-words">
                                                    {msg.message}
                                                </p>

                                                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-gray-500">
                                                    {new Date(
                                                        msg.timestamp ??
                                                        Date.now()
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: '2-digit',
                                                            minute:
                                                                '2-digit',
                                                        }
                                                    )}
                                                    {isMe && (
                                                        <Check className="h-3 w-3 text-blue-500" />
                                                    )}
                                                </div>

                                                {isMe &&
                                                    msg._id &&
                                                    !msg._id.startsWith(
                                                        'temp'
                                                    ) && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    msg._id!
                                                                )
                                                            }
                                                            className="absolute right-1 top-1 opacity-0 hover:opacity-100 text-gray-400 hover:text-red-600 transition"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                        )}
                    </main>

                    {/* Input */}
                    <footer className="flex items-end gap-2 border-t bg-[#f0f2f5] px-4 py-3">
                        <div className="flex-1 rounded-2xl bg-white px-4 py-2 shadow">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(
                                        e.target.scrollHeight,
                                        120
                                    )}px`;
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message"
                                className="w-full resize-none bg-transparent text-sm outline-none"
                            />
                        </div>

                        <button
                            onClick={toggleListening}
                            className={`rounded-full p-3 transition ${isListening
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                        >
                            <Mic className="h-5 w-5" />
                        </button>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="rounded-full bg-[#00a884] p-3 text-white hover:bg-[#008f6f] disabled:bg-gray-300 transition"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
