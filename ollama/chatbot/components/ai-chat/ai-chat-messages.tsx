import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send } from "lucide-react";
import { Button } from "../ui/button";

export default function AIChatArea() {
  const [messages, setMessages] = React.useState<
    { role: string; content: string }[]
  >([]);

  const [prompt, setPrompt] = React.useState("");

  function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(event.target.value);
  }

  const fetchResponse = async () => {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llava:13b",
        messages,
      }),
    });
    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let res: string = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          addMessage("assistant", res);
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        const responseChunk = JSON.parse(chunk);
        // Process the response chunk here
        res += `${responseChunk?.message?.content} `;
      }
    }
  };

  const addMessage = (role: string, content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const sendMessage = () => {
    if (prompt !== "") {
      addMessage("user", prompt);
      setPrompt("");
    }
  };

  React.useEffect(() => console.log(messages), [messages]);

  return (
    <div className="min-h-[calc(100vh-10rem)]">
      <ScrollArea className="h-[calc(100vh-18rem)] w-full p-4 m-8 border">
        <Bot />
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <div>{message.role}</div>
            <div>{message.content}</div>
          </React.Fragment>
        ))}
      </ScrollArea>
      <div className="px-8 flex items-start gap-2">
        <Textarea
          placeholder="Type your prompt here"
          onChange={onChange}
          value={prompt}
        />
        <Button variant={"outline"} size={"icon"} onClick={() => sendMessage()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
