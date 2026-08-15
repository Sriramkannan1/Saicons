import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => adminApi.getAdminData("announcements"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createAnnouncement(data),
    onSuccess: () => {
      toast.success("Announcement created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create announcement"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateAnnouncement(data),
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update announcement"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete announcement"),
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the announcement "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const togglePublish = (item: any) => {
    const isPublished = String(item.published) === "true";
    updateMutation.mutate({ ...item, published: isPublished ? "false" : "true" });
  };

  const filteredAnnouncements = announcements?.filter(
    (a: any) => a.title?.toLowerCase().includes(search.toLowerCase()) || 
                a.message?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">Manage scrolling announcements shown on the public site.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Announcement
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <Megaphone className="h-10 w-10 text-gray-300 mb-4" />
              <p>No announcements found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Announcement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[250px]">{item.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.start_date || "Any"} to {item.end_date || "Any"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.priority === "high" ? "bg-red-100 text-red-800" : 
                        item.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.priority || "normal"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => togglePublish(item)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer ${
                          String(item.published) === "true" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {String(item.published) === "true" ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.title)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AnnouncementFormSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        initialData={editingItem}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate({ ...data, id: editingItem.id });
          } else {
            createMutation.mutate(data);
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </AdminLayout>
  );
}

function AnnouncementFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        setFormData(initialData || {
          title: "",
          message: "",
          priority: "normal",
          start_date: "",
          end_date: "",
          published: "true",
          display_order: "0"
        });
      }
    }, [isOpen, initialData]);
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle>{initialData ? "Edit Announcement" : "Create Announcement"}</SheetTitle>
          <SheetDescription>This will appear in the scrolling banner on the public site.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Internal Title *</Label>
              <Input required placeholder="e.g. Annual Meeting" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
            </div>

            <div>
              <Label>Public Message *</Label>
              <Textarea 
                required 
                placeholder="Join us for the Annual Meeting on Friday..." 
                value={formData.message || ""} 
                onChange={(e) => handleChange("message", e.target.value)} 
              />
            </div>

            <div>
              <Label>Priority</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.priority || "normal"}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date (Optional)</Label>
                <Input type="date" value={formData.start_date || ""} onChange={(e) => handleChange("start_date", e.target.value)} />
              </div>
              <div>
                <Label>End Date (Optional)</Label>
                <Input type="date" value={formData.end_date || ""} onChange={(e) => handleChange("end_date", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={formData.display_order || "0"} onChange={(e) => handleChange("display_order", e.target.value)} />
              </div>
              <div>
                <Label>Published</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={String(formData.published)}
                  onChange={(e) => handleChange("published", e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
