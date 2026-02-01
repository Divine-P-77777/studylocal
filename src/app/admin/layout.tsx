import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, BarChart } from 'lucide-react';

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
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-lg">
            <Users className="h-5 w-5" />
            <span>Tutors</span>
          </Link>
          <Link href="/admin/complaints" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-lg">
            <FileText className="h-5 w-5" />
            <span>Complaints</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
