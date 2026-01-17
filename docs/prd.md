# Baize (白泽) Product Requirements Document (PRD)

## 1. Product Overview (产品概述)

### 1.1 Product Name (产品名称)

- **Name**: Baize (白泽)
- **Type**: Chrome Extension (Side Panel)

### 1.2 Core Value (核心价值)

Baize helps users operate their browser through AI. It supports reading browser content, clicking elements, and filling forms. It resides in a side bar with a main interface consisting of a chat dialog.

### 1.3 Target Audience (目标用户)

Users who want to automate browser tasks or interact with web content using natural language via an AI assistant.

---

## 2. User Interface (用户界面)

### 2.1 Main Chat Interface (主聊天界面)

- **Visual Reference**: `docs/01chat.png`
- **Description**: The primary interface is a chat bubble style dialog box residing in the Chrome Side Panel.
- **Features**:
  - Message history display.
  - Input area for user commands.
  - Settings icon in the top right corner.

### 2.2 Settings Interface (设置界面)

- **Visual Reference**: `docs/02setting.png`
- **Access**: Accessed via the settings icon in the main chat.
- **Configurable Options**:
  - **Language**: Set the display language of the extension.
  - **AI Provider**: Configure the AI model information (Provider, API Key, Model Name).

### 2.3 Chat with Tools (工具调用交互)

- **Visual Reference**: `docs/03chatwithtools.png`
- **Description**: When the user sends a message, the AI may determine that it needs to use browser tools to fulfill the request.
- **Behavior**:
  - The AI's response stream will include indicators of tool usage.
  - Users can see that the AI is performing actions (e.g., "Reading page content...", "Clicking button...").

### 2.4 Tool Details (工具详情)

- **Visual Reference**: `docs/04toolinfo.png`
- **Description**: Users can click on a tool usage indicator to expand and view detailed information.
- **Details Shown**:
  - Tool Name (e.g., `read_content`, `click_element`).
  - Input Arguments (what was sent to the tool).
  - Output/Result (what the tool returned).

---

## 3. Support Functionality (功能需求)

### 3.1 AI Interaction

- **Chat**: Support multi-turn conversation with context history.
- **Streaming**: Responses must be streamed to the UI for real-time feedback using Vercel AI SDK Stream.

### 3.2 Browser Automation Tools (浏览器操作工具)

The AI agent is equipped with tools to interact with the browser page.

- **`read_content`**:
  - **Function**: Read the text or HTML content of the current active tab.
  - **Purpose**: Allow the AI to understand the page context.
- **`click_element`**:
  - **Function**: Click on a specific DOM element on the page.
  - **Purpose**: Navigate or trigger actions on the page.
- **`input_text`**:
  - **Function**: Enter text into form fields.
  - **Purpose**: Fill out forms or search boxes.

### 3.3 Settings Management

- **Persistence**: Save user configurations (Language, AI Provider settings) locally using Chrome Storage or similar.

---

## 4. Technical Stack (技术栈)

### 4.1 Frameworks & Libraries

- **Extension Framework**: [WXT (Web Extension Tools)](https://wxt.dev/)
  - Used for building the Chrome Extension structure (Side Panel, Content Scripts, Background).
- **AI Integration**: [Vercel AI SDK Core](https://ai-sdk.dev/docs/ai-sdk-core)
  - `ai`: Core library for AI model interaction.
- **UI Framework**: React
  - **Components**: [`@ai-sdk/react`](https://ai-sdk.dev/docs/reference/ai-sdk-ui) for chat UI components (useChat, etc.).
- **Streaming**: [Vercel AI SDK Stream](https://ai-sdk.dev/docs/ai-sdk-core/generating-text)
  - Implementation of streaming text responses from the AI provider.
- **Tooling**: [Vercel AI SDK Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
  - Definition and execution of browser interaction tools.

### 4.2 Application Structure

- **Side Panel**: Hosts the main React application (Chat Interface).
- **Background Script**: Handles API requests to AI providers (to avoid CORS issues if necessary, though SDK often handles this).
- **Content Script**: Executes the actual browser actions (`read`, `click`, `input`) on the webpage DOM.
  - Communication between Side Panel/Background and Content Script is required for tool execution.

---

## 5. User Flows (用户流程)

1.  **Open Extension**: User clicks the extension icon or shortcut -> Side Panel opens.
2.  **Configuration (First Run)**:
    - User clicks Settings.
    - User enters AI Provider API Key and Model.
    - User saves settings.
3.  **Chat & Action**:
    - User types "Search for 'DeepMind' on Google".
    - AI analyzes request -> Calls `input_text` tool to search box -> Calls `click_element` tool on Search button.
    - UI shows "Calling input_text...", "Calling click_element...".
    - Browser performs actions.
    - AI reads results via `read_content` (optional, depends on next prompt) -> Returns summary to user.
