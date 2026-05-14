
'use server'

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { wrapAction } from "@/lib/observability/wrap-action";

export const signOut = wrapAction(
  'signOut',
  async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
  },
  { module: 'auth', entityType: 'USER' }
);

