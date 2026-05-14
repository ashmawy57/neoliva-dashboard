
import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { signOut } from "@/app/actions/signout";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 text-center shadow-xl">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4 text-red-600">
            <ShieldAlert size={48} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Access Denied</h1>
          <p className="text-slate-500">
            Your account is not currently linked to any dental clinic.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Why am I seeing this?</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-left opacity-90">
            <li>You haven&apos;t been invited to a clinic yet.</li>
            <li>Your invitation might have expired.</li>
            <li>You are logged in with the wrong email.</li>
          </ul>
        </div>

        <div className="pt-4 space-y-4">
          <p className="text-sm text-slate-500">
            Please contact your clinic administrator to receive an invitation link.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link 
              href="/login"
              className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              Back to Login
            </Link>
            
            <form action={async () => {
              "use server";
              await signOut();
            }}>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
