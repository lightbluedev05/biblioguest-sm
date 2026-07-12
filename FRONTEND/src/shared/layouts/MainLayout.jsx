import { useState } from "react";
import { Sidebar } from "../components/organism/Sidebar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded((prev) => !prev)}
      />
      
      {/* Área de contenido principal */}
      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
