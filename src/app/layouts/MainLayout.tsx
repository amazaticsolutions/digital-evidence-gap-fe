import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";

export function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0e0e0e]">
      <Sidebar />
      <Outlet />
    </div>
  );
}
