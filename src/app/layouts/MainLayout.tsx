import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";

export function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#080808]">
      <Sidebar />
      <Outlet />
    </div>
  );
}
