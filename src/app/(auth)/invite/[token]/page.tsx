import { Suspense } from 'react'
import { cookies }   from 'next/headers'
import Link          from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInvitationByToken, completeInvitation } from '@/app/actions/invitations'
import { redirect } from 'next/navigation'
import {
  UserPlus,
  AlertTriangle,
  Building2,
  ShieldCheck,
  LogIn,
  UserCog,
} from 'lucide-react'

interface PageProps {
  params: Promise<{ token: string }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function roleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

// ─────────────────────────────────────────────────────────────────────────────
// Accept button — Server Action wrapper (Client boundary not needed here
// because we can submit via a form with a hidden input)
// ─────────────────────────────────────────────────────────────────────────────

async function AcceptForm({
  token,
  supabaseId,
}: {
  token:      string
  supabaseId: string
}) {
  async function handleAccept() {
    'use server'
    await completeInvitation(token, supabaseId)
    redirect('/select-tenant')
  }

  return (
    <form action={handleAccept}>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2
                   bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                   text-white font-bold py-3 px-6 rounded-xl transition-all duration-200
                   shadow-lg shadow-blue-500/20 active:scale-[0.98]"
      >
        <ShieldCheck className="w-5 h-5" />
        Accept Invitation &amp; Continue
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params

  // ── 1. Validate the token ──────────────────────────────────────────────────
  let invitation: Awaited<ReturnType<typeof getInvitationByToken>>

  try {
    invitation = await getInvitationByToken(token)
  } catch {
    return (
      <div className="min-h-screen bg-[oklch(0.05_0.02_240)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/[0.03] backdrop-blur-3xl border border-white/[0.07]
                        rounded-[2rem] p-10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Invalid Invitation</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            This invitation link is invalid, has expired, or has already been accepted.
            Please ask your clinic administrator to send a new invitation.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  // ── 2. Check if the user is already authenticated ─────────────────────────
  const supabase     = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── 3. Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[oklch(0.05_0.02_240)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.07]
                        rounded-[2rem] p-10 shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600
                            rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
              <UserPlus className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                You've Been Invited
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Review the details below and accept your invitation.
              </p>
            </div>
          </div>

          {/* Invitation details */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-widest">Clinic</p>
                <p className="text-white font-bold">{invitation.tenantName}</p>
              </div>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-center gap-3">
              <UserCog className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-widest">Your Role</p>
                <p className="text-white font-bold">{roleLabel(invitation.role)}</p>
              </div>
            </div>
            <div className="border-t border-white/[0.04]" />
            <div className="flex items-center gap-3">
              <LogIn className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-white/30 uppercase tracking-widest">Invited Email</p>
                <p className="text-white font-semibold text-sm">{invitation.email}</p>
              </div>
            </div>
          </div>

          {/* CTA — depends on auth state */}
          {user ? (
            /* Authenticated: show accept button */
            <Suspense fallback={null}>
              <AcceptForm token={token} supabaseId={user.id} />
            </Suspense>
          ) : (
            /* Not authenticated: sign in or create account */
            <div className="space-y-3">
              <Link
                href={`/login?invite=${token}`}
                className="w-full inline-flex items-center justify-center gap-2
                           bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                           text-white font-bold py-3 px-6 rounded-xl transition-all duration-200
                           shadow-lg shadow-blue-500/20"
              >
                <LogIn className="w-5 h-5" />
                Sign In to Accept
              </Link>
              <Link
                href={`/staff/sign-in?invite=${token}`}
                className="w-full inline-flex items-center justify-center gap-2
                           border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]
                           text-white/70 hover:text-white font-semibold py-3 px-6 rounded-xl
                           transition-all duration-200"
              >
                <UserPlus className="w-5 h-5" />
                Create Account
              </Link>
              <p className="text-center text-white/25 text-xs">
                Use the same email address as the invitation ({invitation.email})
              </p>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-[10px] text-white/[0.12] tracking-[0.4em] uppercase mt-8">
          Neoliva · Dental Practice Management
        </p>
      </div>
    </div>
  )
}
