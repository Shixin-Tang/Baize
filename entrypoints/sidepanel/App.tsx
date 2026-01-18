import { useState } from "react";
import { Chat } from "../../src/components/Chat";
import { Settings } from "../../src/components/Settings";

function App() {
  const [view, setView] = useState<"chat" | "settings">("chat");

  return (
    <div className="app-shell">
      <div className="app-orb app-orb--one" aria-hidden="true" />
      <div className="app-orb app-orb--two" aria-hidden="true" />
      <div className="app-inner">
        {view === "chat" ? (
          <Chat onOpenSettings={() => setView("settings")} />
        ) : (
          <Settings onBack={() => setView("chat")} />
        )}
      </div>
    </div>
  );
}

export default App;
