import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, Mail, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RejectedPage() {
  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Request Not Approved</h1>
            <p className="text-gray-500">
              Unfortunately, your clinic registration request was not approved at this time.
            </p>
          </div>

          <div className="bg-red-50/50 rounded-xl p-4 text-left border border-red-100">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-red-600 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-900">Need more information?</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  If you believe this is a mistake or would like to provide more details, please reach out to our team.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link 
              href="mailto:admin@neoliva.com"
              className={cn(buttonVariants({ variant: "destructive" }), "w-full py-6 text-base font-medium")}
            >
              Appeal Decision
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
