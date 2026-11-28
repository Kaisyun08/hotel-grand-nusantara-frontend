import React, { useState } from "react";
import {
  Hotel,
  X,
  Settings,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import AddUserModal from "./AddUserModal";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  navigation,
  activeMenu,
  setActiveMenu,
  user,
}) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "AD";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER LOGO (Fixed at Top) */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Hotel size={22} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide text-slate-900">
                GRAND NUSANTARA
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                HOTEL MANAGEMENT
              </span>
            </div>
          </div>

          <button
            className="text-slate-400 hover:text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* MAIN MENU AREA */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            MAIN MENU
          </div>

          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isSelected = activeMenu === item.name;

              return (
                <button
                  key={item.name}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => {
                    setActiveMenu(item.name);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="px-6 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PREFERENCES
          </div>

          <div className="p-4">
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                activeMenu === "Settings"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              onClick={() => {
                setActiveMenu("Settings");
                setSidebarOpen(false);
              }}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* ACCOUNT MANAGEMENT (Add Admin Account) */}
        <div className="px-4 py-3">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            ACCOUNT MANAGEMENT
          </p>
          <button
            type="button"
            onClick={() => {
              setIsAddUserOpen(true);
              if (setSidebarOpen) setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3.5 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <UserPlus size={18} />
            <span>Add Admin</span>
          </button>
        </div>

        {/* FOOTER & PROFILE */}
        <div className="mt-auto shrink-0 space-y-4 border-t border-slate-100 p-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold uppercase text-white">
                {getInitials(user?.nama || user?.name || "AD")}
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-semibold capitalize text-slate-900">
                  {user?.nama || user?.name || "Administrator"}
                </strong>
                <span className="text-[10px] capitalize text-slate-400">
                  {user?.role || "Super Admin"}
                </span>
              </div>
            </div>
            <MoreHorizontal size={18} className="cursor-pointer text-slate-400" />
          </div>
        </div>
      </aside>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={() => {
          // Optional: action after admin account is created
        }}
      />
    </>
  );
}