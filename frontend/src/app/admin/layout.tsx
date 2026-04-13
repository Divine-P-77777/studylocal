import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, MessageSquareWarning, LayoutDashboard } from 'lucide-react';
import { ADMIN_EMAILS } from '@/lib/constants';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session || !session.user || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">StudyLocal</p>
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="mt-4 px-3 space-y-1 flex-1">
          <Link href="/admin" className="flex items-center space-x-2.5 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition font-medium text-sm">
            <Users className="h-4 w-4" />
            <span>Tutors</span>
          </Link>
          <Link href="/admin/complaints" className="flex items-center space-x-2.5 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition font-medium text-sm">
            <MessageSquareWarning className="h-4 w-4" />
            <span>Complaints & Issues</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Logged in as Admin</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
