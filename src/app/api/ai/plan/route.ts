import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { interpretConversation, ConversationMessage } from "@/lib/ai/interpreter";
import { logAiSession } from "@/lib/supabase/ai-logging";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { messages } = requestSchema.parse(json);

    const runtime = await interpretConversation(messages as ConversationMessage[]);

    await logAiSession(messages, runtime);

    return NextResponse.json(runtime);
  } catch (error) {
    console.error("AI plan API error", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid payload", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to generate schema" }, { status: 500 });
  }
}
