import { z } from "zod";
import { tool } from "ai";

export const tools = {
  read_content: tool({
    description: "Read the text content of the current active tab",
    parameters: z.object({}),
    execute: async () => {
      if (typeof chrome === "undefined" || !chrome.tabs)
        return "Browser API not available";
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return "No active tab found";

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "read_content",
      });
      return response.content || "No content found";
    },
  } as any),
  click_element: tool({
    description: "Click on a DOM element using a CSS selector",
    parameters: z.object({
      selector: z.string().describe("The CSS selector of the element to click"),
    }),
    execute: async ({ selector }: { selector: string }) => {
      if (typeof chrome === "undefined" || !chrome.tabs)
        return "Browser API not available";
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return "No active tab found";

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "click_element",
        selector,
      });
      return response.message;
    },
  } as any),
  input_text: tool({
    description: "Input text into a form field using a CSS selector",
    parameters: z.object({
      selector: z.string().describe("The CSS selector of the input field"),
      text: z.string().describe("The text to input"),
    }),
    execute: async ({ selector, text }: { selector: string; text: string }) => {
      if (typeof chrome === "undefined" || !chrome.tabs)
        return "Browser API not available";
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab.id) return "No active tab found";

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "input_text",
        selector,
        text,
      });
      return response.message;
    },
  } as any),
};
