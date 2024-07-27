"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import React from "react";

const StreamResponse = () => {
  const [response, setResponse] = React.useState("");

  const fetchResponse = async () => {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llava:13b",
        prompt: "Why is the sky blue?",
      }),
    });

    if (response !== null) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true && reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + JSON.parse(chunk)?.response);
      }
    }
  };

  return (
    <div>
      <button onClick={fetchResponse}>Fetch Response</button>
      /src/app/components/chat/chat-layout.tsx, chat.tsx, chat-topbar.tsx,
      chat-list.tsx & chat-bottombar.tsx
      <ChatLayout defaultLayout={undefined} navCollapsedSize={8} />
      <p>{response}</p>
    </div>
  );
};

export default StreamResponse;
