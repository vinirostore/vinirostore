import { supabase } from "@/lib/supabase";

export default async function SupabaseDemoPage() {
  if (!supabase) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-slate-900">Supabase connection check</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-medium text-amber-700">Supabase is not configured in this environment yet.</p>
          <p className="mt-2 text-sm text-slate-600">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live database access.</p>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase.from("products").select("*").limit(1);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Supabase connection check</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {error ? (
          <div>
            <p className="text-sm font-medium text-rose-700">Connection failed</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{error.message}</pre>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-emerald-700">Connected successfully</p>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
