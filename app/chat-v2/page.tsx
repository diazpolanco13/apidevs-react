import { ChatSimpleV2 } from "@/components/chat-simple-v2";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ChatV2Page() {
  // Verificar autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChatSimpleV2 />
    </div>
  );
}
