// Development-only Agentation mount at app root.
// Keeps annotation tooling available during local development sessions.

"use client";

import { Agentation } from "agentation";

const AgentationDevtools = () => {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_ENABLE_AGENTATION_DEVTOOLS !== "true"
  ) {
    return null;
  }

  const endpoint =
    process.env.NEXT_PUBLIC_AGENTATION_ENDPOINT || "http://localhost:4747";

  return (
    <Agentation
      endpoint={endpoint}
      onSessionCreated={(sessionId) => {
        console.info("Agentation session started:", sessionId);
      }}
    />
  );
};

export default AgentationDevtools;
