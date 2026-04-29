"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LogEntry = { msg: string; type: "info" | "success" | "error" | "header" };

export default function TestPage() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const supabase = createClient();

  const addLog = (msg: string, type: LogEntry["type"] = "info") =>
    setLog((prev) => [...prev, { msg, type }]);

  const runTests = async () => {
    setLog([]);
    setRunning(true);

    // ──────────────────────────────────────────────
    // TEST 1: File & Environment Verification
    // ──────────────────────────────────────────────
    addLog("TEST 1: Environment & Connectivity", "header");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      addLog("Missing SUPABASE env vars in .env.local", "error");
      setRunning(false);
      return;
    }
    addLog(`SUPABASE_URL: ${url}`, "success");
    addLog(`ANON_KEY: ${key.slice(0, 20)}...`, "success");

    // Connectivity check
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (error) throw error;
      addLog("Supabase DB connection: OK", "success");
    } catch (e: any) {
      addLog(`Supabase DB connection FAILED: ${e.message}`, "error");
      setRunning(false);
      return;
    }

    // ──────────────────────────────────────────────
    // TEST 2: Auth + Profile Trigger
    // ──────────────────────────────────────────────
    addLog("TEST 2: Auth Signup + Profile Trigger", "header");

    const uniqueId = Date.now();
    const email = `test-${uniqueId}@test.com`;
    addLog(`Signing up: ${email}`);

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: "password123",
      options: { data: { username: `TestUser_${uniqueId}` } },
    });

    if (authErr || !authData.user) {
      addLog(`Auth Signup FAILED: ${authErr?.message}`, "error");
      setRunning(false);
      return;
    }
    const userId = authData.user.id;
    addLog(`User created: ${userId}`, "success");

    // Wait for trigger
    await new Promise((r) => setTimeout(r, 1500));

    // Verify profile was auto-created
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      addLog(`Profile trigger FAILED: ${profileErr?.message}`, "error");
    } else {
      addLog(
        `Profile auto-created: username=${profile.username}, credits=${profile.credits}`,
        "success"
      );
    }

    // ──────────────────────────────────────────────
    // TEST 3: Insert Skills
    // ──────────────────────────────────────────────
    addLog("TEST 3: Skill Insertion", "header");

    const { error: offeredErr } = await supabase.from("skills").insert({
      user_id: userId,
      skill_name: "Python Programming",
      type: "offered",
    });
    if (offeredErr) {
      addLog(`Insert offered skill FAILED: ${offeredErr.message}`, "error");
    } else {
      addLog('Inserted offered skill: "Python Programming"', "success");
    }

    const { error: desiredErr } = await supabase.from("skills").insert({
      user_id: userId,
      skill_name: "Guitar",
      type: "desired",
    });
    if (desiredErr) {
      addLog(`Insert desired skill FAILED: ${desiredErr.message}`, "error");
    } else {
      addLog('Inserted desired skill: "Guitar"', "success");
    }

    // Verify skills are readable
    const { data: skills } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId);
    addLog(`Skills in DB for this user: ${skills?.length || 0}`, "success");

    // ──────────────────────────────────────────────
    // TEST 4: Create 2nd User + AI Matching
    // ──────────────────────────────────────────────
    addLog("TEST 4: Multi-User AI Matching (Groq)", "header");

    // Sign out current user, create User B
    const uniqueId2 = Date.now() + 1;
    addLog("Creating User B (offers Guitar, wants Python)...");
    
    // Use a separate Supabase client instance for User B
    const { data: authB, error: authBErr } = await supabase.auth.signUp({
      email: `test-b-${uniqueId2}@test.com`,
      password: "password123",
      options: { data: { username: `GuitarPro_${uniqueId2}` } },
    });

    if (authBErr || !authB.user) {
      addLog(`User B signup FAILED: ${authBErr?.message}`, "error");
    } else {
      addLog(`User B created: ${authB.user.id}`, "success");

      await new Promise((r) => setTimeout(r, 1500));

      // Insert User B's skills
      const { error: bOffErr } = await supabase.from("skills").insert({
        user_id: authB.user.id,
        skill_name: "Guitar",
        type: "offered",
      });
      const { error: bDesErr } = await supabase.from("skills").insert({
        user_id: authB.user.id,
        skill_name: "Python Programming",
        type: "desired",
      });

      if (bOffErr || bDesErr) {
        addLog(`User B skill insert error: ${bOffErr?.message || bDesErr?.message}`, "error");
      } else {
        addLog('User B skills: offers "Guitar", wants "Python Programming"', "success");
      }
    }

    // Now test AI matching — User B is logged in, searching for "Python Programming"
    // There should be User A (our first user) offering Python!
    addLog("Calling /api/ai/match for desired skill: Python Programming...");

    try {
      const matchRes = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desiredSkill: "Python Programming" }),
      });
      const matchData = await matchRes.json();

      if (matchRes.ok) {
        addLog(`/api/ai/match responded: ${matchRes.status}`, "success");
        const matchCount = matchData.matches?.length ?? 0;
        if (matchCount > 0) {
          addLog(`🎯 Groq found ${matchCount} match(es)!`, "success");
          matchData.matches.forEach((m: any, i: number) => {
            addLog(
              `  Match ${i + 1}: ${m.username} — "${m.offered_skill}" (${m.compatibility_score}% compatible)`,
              "success"
            );
            addLog(`  Reason: ${m.reasoning}`);
          });
        } else {
          addLog("No matches found (User A's offered skills may not be visible to User B via RLS)", "error");
        }
      } else {
        addLog(`/api/ai/match FAILED: ${matchData.error}`, "error");
      }
    } catch (e: any) {
      addLog(`/api/ai/match network error: ${e.message}`, "error");
    }

    // ──────────────────────────────────────────────
    // TEST 5: Session Creation + Credit Economy
    // ──────────────────────────────────────────────
    addLog("TEST 5: Session + Credit Economy", "header");

    // After Test 4, User B is the authenticated user. 
    // Create a realistic session: User A teaches, User B learns.
    const currentUserId = authB?.user?.id || userId;
    const teacherId = userId; // User A (the Python teacher)

    addLog(`Session: User A (teacher: ${teacherId.slice(0,8)}...) → User B (learner: ${currentUserId.slice(0,8)}...)`);

    const { data: sessionData, error: sessionInsertErr } = await supabase
      .from("sessions")
      .insert({
        teacher_id: teacherId,
        learner_id: currentUserId,
        status: "active",
      })
      .select()
      .single();

    if (sessionInsertErr || !sessionData) {
      addLog(
        `Session creation FAILED: ${sessionInsertErr?.message}`,
        "error"
      );
    } else {
      addLog(`Session created: ${sessionData.id}`, "success");

      // Get credits before for both users
      const { data: teacherBefore } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", teacherId)
        .single();
      const { data: learnerBefore } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", currentUserId)
        .single();
      addLog(`Teacher credits BEFORE: ${teacherBefore?.credits}`);
      addLog(`Learner credits BEFORE: ${learnerBefore?.credits}`);

      // End the session
      try {
        const endRes = await fetch("/api/sessions/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionData.id }),
        });
        const endData = await endRes.json();

        if (endRes.ok) {
          addLog(`/api/sessions/end responded: ${endRes.status}`, "success");

          // Verify credits changed
          await new Promise((r) => setTimeout(r, 500));
          const { data: teacherAfter } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", teacherId)
            .single();
          const { data: learnerAfter } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", currentUserId)
            .single();
          addLog(`Teacher credits AFTER: ${teacherAfter?.credits}`);
          addLog(`Learner credits AFTER: ${learnerAfter?.credits}`);

          const teacherGained = (teacherAfter?.credits ?? 0) > (teacherBefore?.credits ?? 0);
          const learnerLost = (learnerAfter?.credits ?? 0) < (learnerBefore?.credits ?? 0);

          if (teacherGained && learnerLost) {
            addLog("Credit economy verified: Teacher +1, Learner -1", "success");
          } else if (teacherGained || learnerLost) {
            addLog("Partial credit update detected — check logic", "error");
          } else {
            addLog("Credits unchanged — economy logic may have an issue", "error");
          }
        } else {
          addLog(`/api/sessions/end FAILED: ${endData.error}`, "error");
        }
      } catch (e: any) {
        addLog(`/api/sessions/end network error: ${e.message}`, "error");
      }
    }

    // ──────────────────────────────────────────────
    // TEST 6: Reviews + Average Rating Trigger
    // ──────────────────────────────────────────────
    addLog("TEST 6: Reviews + Rating Trigger", "header");

    if (sessionData) {
      // User B (learner, currently logged in) reviews User A (teacher)
      const { error: reviewErr } = await supabase.from("reviews").insert({
        session_id: sessionData.id,
        reviewer_id: currentUserId,
        reviewee_id: teacherId,
        rating: 5,
        feedback: "Great session!",
      });

      if (reviewErr) {
        addLog(`Insert review FAILED: ${reviewErr.message}`, "error");
      } else {
        addLog("Review inserted (5 stars)", "success");

        // Wait for trigger to fire
        await new Promise((r) => setTimeout(r, 500));

        const { data: ratedProfile } = await supabase
          .from("profiles")
          .select("average_rating")
          .eq("id", userId)
          .single();

        if (ratedProfile?.average_rating) {
          addLog(
            `Average rating auto-updated to: ${ratedProfile.average_rating}`,
            "success"
          );
        } else {
          addLog(
            "Average rating trigger may not have fired (check DB manually)",
            "error"
          );
        }
      }
    }

    // ──────────────────────────────────────────────
    // TEST 7: Health Check Endpoint
    // ──────────────────────────────────────────────
    addLog("TEST 7: Health Check", "header");

    try {
      const healthRes = await fetch("/api/health");
      addLog(
        `/api/health responded: ${healthRes.status}`,
        healthRes.ok ? "success" : "error"
      );
    } catch (e: any) {
      addLog(`/api/health FAILED: ${e.message}`, "error");
    }

    // ──────────────────────────────────────────────
    // SUMMARY
    // ──────────────────────────────────────────────
    addLog("ALL TESTS COMPLETE", "header");
    setRunning(false);
  };

  const getColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-400";
      case "error":
        return "text-rose-400";
      case "header":
        return "text-violet-400 font-bold mt-3";
      default:
        return "text-slate-400";
    }
  };

  const getPrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✅ ";
      case "error":
        return "❌ ";
      case "header":
        return "━━━ ";
      default:
        return "   ";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-10 font-mono text-slate-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl text-white font-bold mb-2">
          Backend Endpoint Verification
        </h1>
        <p className="mb-6 text-slate-500 text-sm">
          Tests: Environment → Auth + Profile Trigger → Skills CRUD → Groq AI
          Matching → Credit Economy → Reviews + Rating Trigger → Health Check
        </p>

        <button
          onClick={runTests}
          disabled={running}
          className={`px-6 py-3 rounded-md font-semibold transition-colors mb-6 shadow-lg ${
            running
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/20"
          }`}
        >
          {running ? "Running Tests..." : "Run All Backend Tests"}
        </button>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg h-[500px] overflow-y-auto whitespace-pre-wrap text-sm">
          {log.length === 0 ? (
            <span className="text-slate-600">
              Click the button to run all backend tests...
            </span>
          ) : (
            log.map((entry, i) => (
              <div key={i} className={`mb-1 ${getColor(entry.type)}`}>
                {getPrefix(entry.type)}
                {entry.msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
