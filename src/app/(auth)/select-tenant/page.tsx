import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rawPrisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { selectTenantAction } from "./actions";

export default async function SelectTenantPage() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <p className="text-sm font-medium">Supabase environment variables are missing.</p>
      </div>
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || !user.email) {
    redirect("/login");
  }

  // Get the DB user record
  const dbUser = await rawPrisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true }
  });

  // Query memberships using tenant_memberships
  const memberships = dbUser
    ? await rawPrisma.tenantMembership.findMany({
        where: {
          userId: dbUser.id,
          isActive: true,
          status: "ACTIVE",
        },
        include: { tenant: true },
      })
    : [];

  const mappedMemberships = memberships.map((m) => ({
    role: m.role, // This is the UPPERCASE role value (OWNER, MANAGER, etc.)
    tenant_id: m.tenantId,
    tenant_name: m.tenant.name,
    tenant_slug: m.tenant.slug,
  }));

  // If memberships.length === 0 -> show "No clinic access" error message
  if (mappedMemberships.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/30">
            <span className="text-red-400 font-bold text-xl">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">No Clinic Access</h1>
            <p className="text-sm text-zinc-400">
              Your account ({user.email}) is not associated with any active dental clinics.
            </p>
          </div>
          <div className="pt-4">
            <a
              href="/login"
              className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              ← Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If memberships.length === 1 -> redirect to route handler
  if (mappedMemberships.length === 1) {
    redirect(`/api/select-tenant?tenantId=${mappedMemberships[0].tenant_id}`);
  }

  // If memberships.length > 1 -> show the selection UI (list of clinic cards)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-4 relative overflow-hidden">
      {/* Background gradients for premium glassmorphism vibe */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-xl space-y-8 z-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome to Neoliva
          </h1>
          <p className="text-zinc-400 text-sm">
            Select the clinic dashboard you wish to access today
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mappedMemberships.map((m) => (
            <Card
              key={m.tenant_id}
              className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl hover:border-zinc-700/80 transition-all hover:scale-[1.02] flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-zinc-100 leading-tight">
                    {m.tenant_name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-teal-500/10 text-teal-400 border border-teal-500/20 whitespace-nowrap text-xs font-semibold capitalize"
                  >
                    {m.role.replace("_", " ")}
                  </Badge>
                </div>
                <CardDescription className="text-zinc-500 text-xs">
                  slug: {m.tenant_slug}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-zinc-400">
                  Access your appointments, patient records, and clinic settings.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <form action={selectTenantAction} className="w-full">
                  <input type="hidden" name="tenantId" value={m.tenant_id} />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-zinc-950 font-bold transition-all shadow-lg shadow-teal-500/10 hover:shadow-teal-500/25 border-0"
                  >
                    Enter Clinic
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Signed in as <span className="text-zinc-400">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
