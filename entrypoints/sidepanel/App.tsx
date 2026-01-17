import { useState } from "react";
import { Chat } from "../../src/components/Chat";
import { Settings } from "../../src/components/Settings";

function App() {
  const [view, setView] = useState<"chat" | "settings">("chat");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      {view === "chat" ? (
        <Chat onOpenSettings={() => setView("settings")} />
      ) : (
        <Settings onBack={() => setView("chat")} />
      )}
    </div>
  );
}

export default App;
