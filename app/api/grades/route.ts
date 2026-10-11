import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Returns the student's saved grades (if logged in) so the calculator can pre-fill.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ grades: null });

  const { data } = await supabase
    .from("student_grades").select("grades").eq("user_id", user.id).maybeSingle();
  return NextResponse.json({ grades: data?.grades ?? null });
}
