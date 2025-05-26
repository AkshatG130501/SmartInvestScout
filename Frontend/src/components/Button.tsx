import React from "react";
import { ArrowRight, ExternalLink, Check } from "lucide-react";

interface ButtonProps {
  label: string;
  primary?: boolean;
  secondary?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: "arrow-right" | "external-link" | "check" | null;
}

const Button: React.FC<ButtonProps> = ({
  label,
  primary = false,
  secondary = false,
  onClick,
  className = "",
  icon = null,
}) => {
  const getButtonClasses = () => {
    if (primary) {
      return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg";
    }
    if (secondary) {
      return "bg-white hover:bg-gray-50 text-indigo-600 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow";
    }
    return "bg-gray-200 hover:bg-gray-300 text-gray-800";
  };

  const getIcon = () => {
    switch (icon) {
      case "arrow-right":
        return <ArrowRight className="h-4 w-4 ml-2" />;
      case "external-link":
        return <ExternalLink className="h-4 w-4 ml-2" />;
      case "check":
        return <Check className="h-4 w-4 ml-2" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center ${getButtonClasses()} ${className}`}
    >
      {label}
      {getIcon()}
    </button>
  );
};

export default Button;
