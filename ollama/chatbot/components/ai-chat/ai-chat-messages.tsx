import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Bot, ChevronRight, Send } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
// { role: string; content: string }

// {role: "user", content: "hello"},
// {role: "ai", content: "hello there"},

const dateFormat = "HH:mm";

export default function AIChatArea() {
  const [session, setSession] = React.useState<Record<string, any>[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [responding, setResponding] = React.useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(event.target.value);
  }

  const scrollToBottom = () => {
    // ! NOT WORKING
    // console.log(scrollContainerRef.current);
    // scrollContainerRef.current?.scrollTo({
    //   top: scrollContainerRef.current.scrollHeight,
    //   behavior: "smooth",
    // });
    // // scrollContainerRef.current?.scrollIntoView({
    // //   behavior: "smooth",
    // // });
  };

  const fetchResponse = async (prompt: string) => {
    setResponding(true);
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          prompt,
        }),
      });
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let res: string = "";
        while (true) {
          const reading = await reader.read();
          const { done, value } = reading;
          if (done) {
            setSession((prev) => {
              const newState = [
                ...prev,
                {
                  role: "ai",
                  content: res,
                  createdOn: format(Date.now(), dateFormat),
                },
              ];
              localStorage.setItem("session", JSON.stringify(newState));
              return newState;
            });
            scrollToBottom();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          const responseChunk = JSON.parse(chunk);
          // Process the response chunk here
          res += `${responseChunk?.response || ""} `;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setResponding(false);
    }
  };

  const sendMessage = () => {
    setSession((prev) => {
      const newState = [
        ...prev,
        {
          role: "user",
          content: prompt,
          createdOn: format(Date.now(), dateFormat),
        },
      ];
      localStorage.setItem("session", JSON.stringify(newState));
      return newState;
    });
    fetchResponse(prompt);
    setPrompt("");
    scrollToBottom();
  };

  React.useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      setSession(JSON.parse(session));
    }

    return () => {
      localStorage.setItem("session", session ?? "[]");
    };
  }, []);

  return (
    <div className="overflow-hidden space-y-2">
      <div className="flex items-center justify-end w-full">
        <Button
          variant={"destructive"}
          onClick={() => {
            localStorage.removeItem("session");
            setSession([]);
          }}
        >
          Clear chat
        </Button>
      </div>
      <ScrollArea
        ref={scrollContainerRef}
        className="h-[calc(100vh-15rem)] w-full border-b"
      >
        <div className="p-4 flex flex-col gap-2 mx-4">
          {session.map((message, index) => (
            <React.Fragment key={index}>
              <ChatterBox
                className={cn(
                  "self-start",
                  message.role === "user" && "self-end"
                )}
              >
                {message.role === "user" ? (
                  <ChevronRight className="w-6 h-6 shrink-0" />
                ) : (
                  <Bot className="w-6 h-6 shrink-0" />
                )}
                <div>{message.content}</div>
              </ChatterBox>
              <span
                className={cn(
                  "self-start text-xs text-zinc-400",
                  message.role === "user" && "self-end"
                )}
              >
                {message.createdOn}
              </span>
            </React.Fragment>
          ))}
          {responding && (
            <ChatterBox>
              <span className="animate-pulse flex flex-row items-center gap-2">
                <Bot className="w-6 h-6" />
                <div className="italic">.....</div>
              </span>
            </ChatterBox>
          )}
        </div>
      </ScrollArea>

      <div className="m-2 px-2 py-4 flex items-start gap-2">
        <Textarea
          placeholder="Type your prompt here"
          onChange={onChange}
          value={prompt}
        />
        <Button
          disabled={responding}
          variant={"outline"}
          size={"icon"}
          onClick={() => sendMessage()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const ChatterBox = (
  props: React.PropsWithChildren<{
    style?: React.CSSProperties;
    className?: string;
  }>
) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "border p-4 w-fit min-w-48 max-w-[75%] flex flex-row items-start gap-2 rounded-lg border-zinc-300 dark:border-zinc-800",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
