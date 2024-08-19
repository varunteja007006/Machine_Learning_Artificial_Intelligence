import React from "react";
import { Switch } from "@/components/ui/switch";

export default function AIChatSidebar({
  checked,
  setChecked,
}: Readonly<{
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
}>) {
  return (
    <div className="min-h-[calc(100vh-10rem)]">
      <div className="block">Your Personal Assistant</div>
      <div className="flex items-center gap-5">
        <p>Prompts</p>
        <Switch checked={checked} onCheckedChange={setChecked} />
        <p>Chat</p>
      </div>
    </div>
  );
}
