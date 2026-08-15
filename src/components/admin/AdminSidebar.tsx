import { Link, useRouterState } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Users, 
  UserCog, 
  Megaphone, 
  HelpCircle, 
  Image as ImageIcon, 
  Settings, 
  Link2, 
  Activity,
  LogOut
} from "lucide-react";
import { clearAdminToken } from "@/lib/admin-api";
import { useNavigate } from "@tanstack/react-router";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "CONTENT", isHeader: true },
  { name: "Projects & Events", href: "/admin/projects", icon: FolderKanban },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Team Roles", href: "/admin/team-roles", icon: UserCog },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { name: "MEDIA", isHeader: true },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "SITE", isHeader: true },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
  { name: "Social Links", href: "/admin/social-links", icon: Link2 },
  { name: "SYSTEM", isHeader: true },
  { name: "Activity Logs", href: "/admin/activity", icon: Activity },
];

export function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminToken();
    navigate({ to: "/admin/login" });
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <span className="font-display font-bold text-lg text-gray-900 tracking-wider">SAICONS CMS</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            if (item.isHeader) {
              return (
                <div key={item.name} className="pt-4 pb-1 px-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.name}
                  </p>
                </div>
              );
            }
            
            const isActive = item.exact ? currentPath === item.href : currentPath.startsWith(item.href || "");
            
            return (
              <Link
                key={item.name}
                to={item.href!}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                {item.icon && (
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors
                      ${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"}
                    `}
                    aria-hidden="true"
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>
    </>
  );
}
