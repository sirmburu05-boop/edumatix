import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CLUSTERS, calculateAllClusters } from "@/lib/clusterEngine";
import { ALL_SUBJECTS, GRADE_POINTS } from "@/lib/subjects";

const CORE = ["English", "Kiswahili", "Mathematics"];
const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const input = body?.grades;

  // ---- validate (never trust the browser) ----
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const grades: Record<string, string> = {};
  for (const [subject, grade] of Object.entries(input as Record<string, unknown>)) {
    if (!ALL_SUBJECTS.includes(subject) || typeof grade !== "string" || !has(GRADE_POINTS, grade)) {
      return NextResponse.json({ error: "Invalid subject or grade." }, { status: 400 });
    }
    grades[subject] = grade;
  }
  const count = Object.keys(grades).length;
  if (count < 7 || count > 8 || !CORE.every((s) => has(grades, s))) {
    return NextResponse.json(
      { error: "Select English, Kiswahili, Mathematics and 7 to 8 subjects in total." },
      { status: 400 }
    );
  }

  // ---- who is asking? ----
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let activated = false;
  if (user) {
    // Always save the grades, even if not activated, so they are ready after payment.
    await createAdminClient()
      .from("student_grades")
      .upsert({ user_id: user.id, grades, updated_at: new Date().toISOString() });

    const { data: profile } = await supabase
      .from("profiles").select("activated").eq("id", user.id).single();
    activated = !!profile?.activated;
  }

  // ---- not activated: send NO real results ----
  if (!activated) {
    return NextResponse.json({
      locked: true,
      loggedIn: !!user,
      clusters: [...CLUSTERS].sort((a, b) => a.n - b.n).map((c) => ({ n: c.n, name: c.name })),
    });
  }

  // ---- activated: full results ----
  const { results, m, best7 } = calculateAllClusters(grades);
  return NextResponse.json({
    locked: false,
    loggedIn: true,
    m,
    best7,
    results: results.map((c) => ({ n: c.n, name: c.name, points: c.points, r: c.r, missing: c.missing })),
  });
}
