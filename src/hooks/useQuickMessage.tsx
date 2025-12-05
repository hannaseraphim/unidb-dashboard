import { useState, useCallback, useEffect } from "react";

type ToastType = "info" | "success" | "error";

export const useQuickMessage = () => {
  const [message, setMessage] = useState("");
  const [activeMessage, setActiveMessage] = useState(false);
  const [type, setType] = useState<ToastType>("info");

  const showMessage = useCallback(
    (msgContent: string, msgType: ToastType = "info") => {
      setMessage(msgContent);
      setType(msgType);
      setActiveMessage(true);
    },
    []
  );

  useEffect(() => {
    if (!activeMessage) return;
    const timer = setTimeout(() => setActiveMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [activeMessage]);

  const Toast = () => {
    const typeStyles: Record<ToastType, string> = {
      info: "bg-blue-50 text-blue-700 border-blue-300",
      success: "bg-green-50 text-green-700 border-green-300",
      error: "bg-red-50 text-red-700 border-red-300",
    };

    return (
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-1000
          transform transition-all duration-300 ease-out
          ${
            activeMessage
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }
        `}
        role="alert"
        aria-labelledby="toast-label"
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${typeStyles[type]}`}
        >
          <span>
            {type === "success" && "✅"}
            {type === "error" && "❌"}
            {type === "info" && "ℹ️"}
          </span>
          <p id="toast-label" className="text-sm font-medium">
            {message}
          </p>
        </div>
      </div>
    );
  };

  return { showMessage, Toast };
};
