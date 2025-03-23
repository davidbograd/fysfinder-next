import { NextResponse } from "next/server";

const paths = [
  "/",
  "/find/fysioterapeut/danmark",
  "/find/fysioterapeut/*", // This will revalidate all location pages
  "/klinik/*", // This will revalidate all clinic pages
  "/fysioterapeut-artikler/*", // This will revalidate all article pages
];

export async function POST() {
  try {
    const results = [];

    for (const path of paths) {
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_SITE_URL
          }/api/revalidate?path=${encodeURIComponent(path)}&token=${
            process.env.REVALIDATE_TOKEN
          }`
        );
        results.push({ path, success: true });
      } catch (error) {
        results.push({ path, success: false, error: (error as Error).message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
