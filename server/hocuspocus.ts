import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../.env.local") });

import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { createClient } from "@supabase/supabase-js";
import * as Y from "yjs";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

function createAuthClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

const server = new Server({
  port: parseInt(process.env.HOCUSPOCUS_PORT || "1234", 10),
  extensions: [
    new Logger(),
    new Database({
      async fetch({ documentName, context }) {
        try {
          const token = (context as Record<string, string>)?.user_token;

          const client = token ? createAuthClient(token) : createClient(supabaseUrl, supabaseAnonKey);
          const { data, error } = await client
            .from("documents")
            .select("yjs_snapshot")
            .eq("id", documentName)
            .single();

          if (error || !data?.yjs_snapshot) {
            return null;
          }

          const raw = data.yjs_snapshot;
          let bytes: Buffer;
          if (typeof raw === "string") {
            const hex = raw.startsWith("\\x") ? raw.slice(2) : raw;
            bytes = Buffer.from(hex, "hex");
          } else {
            bytes = Buffer.from(raw);
          }

          const doc = new Y.Doc();
          Y.applyUpdate(doc, bytes);
          doc.destroy();

          return bytes;
        } catch (err) {
          console.error("Corrupted snapshot, starting fresh:", err instanceof Error ? err.message : err);
          return null;
        }
      },
      async store({ documentName, state, lastContext }) {
        const token = (lastContext as Record<string, string>)?.user_token;
        const client = token
          ? createAuthClient(token)
          : createClient(supabaseUrl, supabaseAnonKey);
        await client
          .from("documents")
          .update({
            yjs_snapshot: `\\x${(state as Buffer).toString("hex")}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentName);
      },
    }),
  ],
  async onAuthenticate({ token, context }) {
    if (!token) {
      throw new Error("No JWT token provided");
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Invalid JWT token");
    }

    (context as Record<string, string>).user_token = token;
  },
});

server.listen();
console.log(`Hocuspocus server running on port ${process.env.HOCUSPOCUS_PORT || 1234}`);
