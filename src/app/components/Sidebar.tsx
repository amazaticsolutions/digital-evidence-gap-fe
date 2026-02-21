import { Plus, FolderOpen } from "lucide-react";
import { NavLink } from "react-router";
import { useTheme } from "../../hooks/useTheme";
import logoSvg from "../../assets/logo.svg";
import logoLightSvg from "../../assets/logo-light.svg";

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen transition-colors shadow-lg">
      {/* Logo Area */}
      <div className="p-6 ">
        <div className="flex items-center gap-2">
          <div className="w-15 h-15 rounded-lg flex items-center justify-center p-1.5">
            <img
              src={theme === "dark" ? logoLightSvg : logoSvg}
              alt="Evidence Search Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-black dark:text-white">
              EvidenceTrace.AI
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <NavLink
            to="/new-case"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`
            }
          >
            <Plus
              className="w-5 h-5 border-1 border-black dark:border-white rounded-full"
              strokeWidth={2}
            />
            <span className="font-medium">New Case</span>
          </NavLink>

          <NavLink
            to="/past-cases"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`
            }
          >
            <FolderOpen className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Past Cases</span>
          </NavLink>
        </div>
      </nav>

      {/* Dark Mode Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dark Mode
          </span>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 cursor-pointer ${
              theme === "dark"
                ? "bg-black dark:bg-white"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
            role="switch"
            aria-checked={theme === "dark"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* User Section - Commented out for now */}
      {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 bg-black dark:bg-white rounded-full flex items-center justify-center">
            <span className="text-sm text-white dark:text-black font-medium">
              JD
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-black dark:text-white">
              John Doe
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Investigator
            </p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <LogOut
              className="w-4 h-4 text-gray-600 dark:text-gray-400"
              strokeWidth={2}
            />
          </button>
        </div>
      </div> */}
    </aside>
  );
}
