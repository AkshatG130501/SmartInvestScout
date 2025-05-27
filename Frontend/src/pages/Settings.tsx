import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Lock, Eye, Moon, Sun, Layers } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, viewMode, toggleTheme, toggleViewMode } = useTheme();

  // Local state to track checkbox values
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [isCompactView, setIsCompactView] = useState(viewMode === "compact");

  // Update theme when checkbox changes
  useEffect(() => {
    if (isDarkMode && theme !== "dark") {
      toggleTheme();
    } else if (!isDarkMode && theme !== "light") {
      toggleTheme();
    }
  }, [isDarkMode, theme, toggleTheme]);

  // Update view mode when checkbox changes
  useEffect(() => {
    if (isCompactView && viewMode !== "compact") {
      toggleViewMode();
    } else if (!isCompactView && viewMode !== "default") {
      toggleViewMode();
    }
  }, [isCompactView, viewMode, toggleViewMode]);

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle compact view toggle
  const handleCompactViewToggle = () => {
    setIsCompactView(!isCompactView);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-200">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h1>

          <div className="space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Appearance
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Theme
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      {isDarkMode ? (
                        <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500 mr-3" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {isDarkMode ? "Dark mode" : "Light mode"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={handleDarkModeToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Switch between light and dark mode for the application
                    interface.
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Layout
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {isCompactView ? "Compact view" : "Default view"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompactView}
                        onChange={handleCompactViewToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Compact view reduces spacing and makes more content visible
                    at once.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
