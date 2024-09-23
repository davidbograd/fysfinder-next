import { createClient } from "@/app/utils/supabase/server";

export default async function Notes() {
  const supabase = createClient();

  // Fetch notes
  const { data: notes } = await supabase.from("notes").select("title");

  // Fetch total count of clinics
  const { count } = await supabase
    .from("clinics")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <p>Total clinics are {count ?? 0}.</p>

      {notes?.map((note) => (
        <h1 key={note.id}>{note.title}</h1>
      ))}
    </div>
  );
}
