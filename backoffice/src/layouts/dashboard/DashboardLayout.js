import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return _jsxs("div", {
    className:
      "flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900",
    children: [
      isSidebarOpen &&
        _jsx("div", {
          className:
            "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden",
          onClick: () => setIsSidebarOpen(false),
        }),
      _jsx("div", {
        className: `
        fixed inset-y-0 left-0 z-50 flex h-full transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `,
        children: _jsx(Sidebar, {}),
      }),
      _jsxs("div", {
        className: "flex flex-1 flex-col overflow-hidden min-w-0",
        children: [
          _jsx(Header, { onMenuClick: () => setIsSidebarOpen(true) }),
          _jsx("main", {
            className:
              "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 custom-scrollbar flex flex-col items-center",
            children: _jsx("div", {
              className:
                "w-full max-w-7xl mx-auto animate-in fade-in duration-300",
              children: _jsx(Outlet, {}),
            }),
          }),
        ],
      }),
    ],
  });
}
