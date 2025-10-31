import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ConversationMessage } from "@/lib/ai/interpreter";
import { BusinessAppRuntimePayload } from "@/lib/schema";

export async function logAiSession(
  messages: ConversationMessage[],
  runtime: BusinessAppRuntimePayload,
): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return;
  try {
    await client.from("ai_ui_sessions").insert({
      messages,
      runtime,
    });
  } catch (error) {
    console.warn("Failed to log AI session", error);
  }
}
