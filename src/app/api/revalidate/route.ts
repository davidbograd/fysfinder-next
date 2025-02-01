import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Basic security check - you should replace this with your actual secret
  const token = request.nextUrl.searchParams.get("token");
  if (!process.env.REVALIDATE_TOKEN || token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path") || "/";

  try {
    // Handle wildcard paths
    if (path.includes("*")) {
      const basePath = path.replace("/*", "");
      revalidatePath(basePath, "layout");
    } else {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error revalidating",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
