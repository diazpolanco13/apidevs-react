import { ChatSimple } from "@/components/chat-simple";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  // Verificar autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChatSimple />
    </div>
  );
}
