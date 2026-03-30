import React, { useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const Toast = ({ message, type = "error", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-[100] animate-fade-in-down flex items-center gap-2`}
    >
      {type === "error" ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      {message}
    </div>
  );
};

export default Toast;
