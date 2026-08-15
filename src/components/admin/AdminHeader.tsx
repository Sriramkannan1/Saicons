import { Menu } from "lucide-react";

export function AdminHeader({ setMobileOpen }: { setMobileOpen: (open: boolean) => void }) {
  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden hover:bg-gray-50"
        onClick={() => setMobileOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {/* The page title can be injected here or just leave blank */}
          </h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 py-1.5 px-3 rounded-full">
            Admin Session Active
          </div>
        </div>
      </div>
    </div>
  );
}
