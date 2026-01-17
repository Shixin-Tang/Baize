import { useState, useCallback, useEffect } from "react";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { tools } from "../lib/tools";

export function useBaizeChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<{
    apiKey: string;
    baseUrl: string;
    model: string;
    language: string;
  } | null>(null);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(
        ["apiKey", "baseUrl", "model", "language"],
        (result) => {
          setConfig({
            apiKey: (result.apiKey as string) || "",
            baseUrl: (result.baseUrl as string) || "",
            model: (result.model as string) || "gemini-2.0-flash-exp",
            language: (result.language as string) || "en",
          });
        },
      );
    }
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || !config) return;

      setIsLoading(true);
      const userMessage = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        let provider;
        if (config.model.includes("gpt")) {
          provider = createOpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl || undefined,
          });
        } else {
          provider = createGoogleGenerativeAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl || undefined,
          });
        }

        const systemPrompt =
          config.language === "zh"
            ? "你是白泽 (Baize)，一个强大的浏览器AI助手。你可以读取网页内容，点击按钮，输入文字。请根据用户需求使用工具。"
            : "You are Baize, a powerful browser AI assistant. You can read page content, click buttons, and input text. Use tools as needed to fulfill user requests.";

        const result = await streamText({
          model: provider(config.model),
          system: systemPrompt,
          messages: [...messages, userMessage] as any,
          tools: tools,
          maxSteps: 5,
        } as any);

        let accumulatedText = "";
        let toolCalls: Record<string, any> = {};

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            accumulatedText +=
              (part as any).text || (part as any).textDelta || "";
          } else if (part.type === "tool-call") {
            const toolCallPart = part;
            toolCalls[toolCallPart.toolCallId] = toolCallPart;
          }

          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            // Ensure we are updating the last assistant message we added
            if (lastMsg.role === "assistant") {
              if (Object.keys(toolCalls).length > 0) {
                const contentParts: any[] = [];
                if (accumulatedText)
                  contentParts.push({ type: "text", text: accumulatedText });
                Object.values(toolCalls).forEach((tc) => {
                  contentParts.push({ type: "tool-call", ...tc.toolCall });
                });
                newMessages[newMessages.length - 1] = {
                  ...lastMsg,
                  content: contentParts,
                };
              } else {
                newMessages[newMessages.length - 1] = {
                  ...lastMsg,
                  content: accumulatedText,
                };
              }
            }
            return newMessages;
          });
        }

        // Handle tool results automatically?
        // streamText with tools and maxSteps handles execution automatically if maxSteps > 1
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error: " + (error as Error).message },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, config, messages],
  );

  // Rethink: implementing robust streaming + tool calls manually is error prone.
  // I will use 'useChat' but with a custom 'fetch' that calls my local handle function.
  // OR simply let's stick to the manual implementation but keeping it simple:
  // Wait for full response? No, user wants streaming.

  // Let's go with a simpler Manual Implementation that works:
  // We will call `streamText` and just set the messages to what `result.response.messages` returns (helper)
  // Unfortunately `streamText` returns a result helper, but the stream is async.

  // Revised Strategy:
  // Use `useChat` from `@ai-sdk/react`.
  // Mock the `fetch` function passed to `useChat`? No, `useChat` uses `fetch` internally to call an API.
  // We can pass `api: '/api/chat'` and intercept the network request? No.

  // We can use `useChat` with a custom `mutation`? No.

  // Okay, I will implement a simpler `useBaizeChat` using `streamText` in a simplified way:
  // 1. Append User Message.
  // 2. Call `streamText`.
  // 3. Iterate `result.fullStream`.
  // 4. Update a generic "Assistant" message state that accumulates text and tool calls.

  return {
    messages,
    input,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setInput(e.target.value),
    handleSubmit,
    isLoading,
    config,
  };
}
