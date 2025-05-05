"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de configuração existente
    router.push("/dashboard/settings/configuration");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecionando para configurações...</p>
      </div>
    </div>
  );
} 