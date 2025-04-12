import type { LoaderFunction } from "@remix-run/node";
import { createReadStream } from "fs";
import { join } from "path";
import { stat } from "fs/promises";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const fileName = url.searchParams.get("file");
  const allowedFiles = ["chat.js", "chat.css"];

  if (!fileName || !allowedFiles.includes(fileName)) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  const filePath = join(process.cwd(), "public", "embeded", fileName);

  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw new Error("Not a file");

    const contentType = fileName.endsWith(".css")
      ? "text/css"
      : "text/javascript";

    // @ts-ignore
    return new Response(createReadStream(filePath), {
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    return json({ error: "File not found" }, { status: 404 });
  }
};
