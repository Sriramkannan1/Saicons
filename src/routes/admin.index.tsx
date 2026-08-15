import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { FolderKanban, FileText, Users, Activity, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminApi.getDashboard(),
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of SAICONS website content.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">Failed to load dashboard data. {(error as Error).message}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard title="Total Projects" value={data?.metrics?.totalProjects || 0} icon={FolderKanban} />
            <MetricCard title="Published Projects" value={data?.metrics?.publishedProjects || 0} icon={FolderKanban} color="text-green-600" />
            <MetricCard title="Blog Posts" value={data?.metrics?.totalBlogs || 0} icon={FileText} />
            <MetricCard title="Team Members" value={data?.metrics?.totalTeam || 0} icon={Users} />
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-gray-400" />
                Recent Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {data?.activity && data.activity.length > 0 ? (
                data.activity.map((log: any) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-blue-600 truncate">{log.entity} — {log.entity_id}</p>
                    <p className="text-sm text-gray-500">{log.action} by {log.admin} • {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No recent activity recorded.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function MetricCard({ title, value, icon: Icon, color = "text-blue-600" }: { title: string; value: number; icon: any; color?: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
