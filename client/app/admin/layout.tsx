import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
// Note: We should ideally check for Admin role here in the layout or page
// For now, we reuse the Dashboard layout structure but maybe simplified
// Or just let it inherit?
// Let's make a simple layout that reuses the Dashboard Sidebar but ensures we are in "Admin Mode" visually?
// For simplicity, we can just use the same Dashboard Layout structure if we put it under /dashboard/admin?
// But the user requested /admin.
// So let's create a layout that uses the Sidebar.

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Reusing Sidebar for now, or we can make a specific AdminSidebar later */}
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4">
                    <h1 className="text-xl font-bold text-red-600">ADMIN DASHBOARD</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
