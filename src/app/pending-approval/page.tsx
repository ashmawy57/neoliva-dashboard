import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Mail, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  
  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Request Under Review</h1>
            <p className="text-gray-500">
              Your clinic registration is currently being reviewed by our administration team.
            </p>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-4 text-left border border-blue-100">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">What happens next?</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  We will verify your clinic details. You'll receive an email notification once your account is activated.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link 
              href="mailto:support@neoliva.com"
              className={cn(buttonVariants({ variant: "outline" }), "w-full py-6 text-base font-medium")}
            >
              Contact Support
            </Link>
            
            <form action={handleSignOut}>
              <Button type="submit" variant="ghost" className="w-full text-gray-400 hover:text-gray-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
