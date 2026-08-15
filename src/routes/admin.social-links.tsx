import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/social-links")({
  component: AdminSocialLinks,
});

function AdminSocialLinks() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery({
    queryKey: ["admin", "social_links"],
    queryFn: () => adminApi.getAdminData("social_links"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createSocialLink(data),
    onSuccess: () => {
      toast.success("Social link created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "social_links"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create link"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSocialLink(data),
    onSuccess: () => {
      toast.success("Social link updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "social_links"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update link"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSocialLink(id),
    onSuccess: () => {
      toast.success("Social link deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "social_links"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete link"),
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, platform: string) => {
    if (confirm(`Are you sure you want to delete the link for ${platform}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleActive = (item: any) => {
    const isActive = String(item.active) !== "false";
    updateMutation.mutate({ ...item, active: isActive ? "false" : "true" });
  };

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the social media icons and links shown in the footer.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Social Link
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !links || links.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <Link2 className="h-10 w-10 text-gray-300 mb-4" />
              <p>No social links configured.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">{item.platform}</div>
                      <div className="text-xs text-gray-500">Icon: {item.icon || "default"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {item.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.display_order || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleActive(item)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity cursor-pointer ${
                          String(item.active) !== "false" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {String(item.active) !== "false" ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.platform)}>
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

      <SocialLinkFormSheet 
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

function SocialLinkFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        setFormData(initialData || {
          platform: "Instagram",
          url: "",
          icon: "Instagram",
          display_order: "0",
          active: "true"
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
          <SheetTitle className="text-slate-900">{initialData ? "Edit Social Link" : "Add Social Link"}</SheetTitle>
          <SheetDescription className="text-slate-600">Configure a social media profile link for the site footer.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-slate-900">Platform Name</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.platform || ""}
                onChange={(e) => {
                  handleChange("platform", e.target.value);
                  handleChange("icon", e.target.value); // Auto-sync icon name
                }}
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter / X</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>

            <div>
              <Label className="text-slate-900">Profile URL *</Label>
              <Input required type="url" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" placeholder="https://instagram.com/..." value={formData.url || ""} onChange={(e) => handleChange("url", e.target.value)} />
            </div>

            <div>
              <Label className="text-slate-900">Lucide Icon Name</Label>
              <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" placeholder="e.g. Instagram" value={formData.icon || ""} onChange={(e) => handleChange("icon", e.target.value)} />
              <p className="text-xs text-slate-500 mt-1">Must match a Lucide React icon name exactly.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Display Order</Label>
                <Input type="number" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.display_order || "0"} onChange={(e) => handleChange("display_order", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">Active</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={String(formData.active)}
                  onChange={(e) => handleChange("active", e.target.value)}
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
              Save Link
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
