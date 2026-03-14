import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import { getPrisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ManagerShiftsPage() {
  const prisma = getPrisma();
  const session = await verifySession();

  // Get users who have shifts assigned
  const allUsers = await prisma.user.findMany({
    where: { 
      isDeleted: false,
      NOT: { shiftStart: null, shiftEnd: null }
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      shiftStart: true,
      shiftEnd: true,
    }
  });

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6 flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/manager/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              &larr; Back
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Staff Shifts</h1>
          <p className="text-zinc-500 dark:text-zinc-400">View daily roster assignments in real-time</p>
        </div>
        <div className="flex gap-4">
          <Link href="/manager/dashboard" className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
            Back to Dashboard
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto w-full">
        {allUsers.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Shift Management</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              No active shift slots found. Admins can update your shift schedules directly from the "Manage Users" administrative console.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
               <h2 className="text-xl font-bold">Today's Schedule</h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
               {allUsers.map((user) => {
                 const isCurrentUser = user.id === session?.userId;
                 return (
                   <div key={user.id} className={`p-6 flex items-center justify-between transition-colors ${isCurrentUser ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-500">
                         {user.fullName.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <p className="font-bold text-lg flex items-center gap-2">
                             {user.fullName}
                             {isCurrentUser && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">YOU</span>}
                          </p>
                          <p className="text-sm text-zinc-500 uppercase tracking-wider">{user.role}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg font-mono">
                         <span className="text-green-600 dark:text-green-400 font-bold">{user.shiftStart || '--:--'}</span>
                         <span className="text-zinc-400">-</span>
                         <span className="text-red-600 dark:text-red-400 font-bold">{user.shiftEnd || '--:--'}</span>
                       </div>
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}