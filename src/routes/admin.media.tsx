import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { extractGoogleDriveId } from "@/components/admin/ImageUrlInput";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, ExternalLink, Image as ImageIcon } from "lucide-react";
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

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

function AdminMedia() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => adminApi.getAdminData("media"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createMedia(data),
    onSuccess: () => {
      toast.success("Media added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to add media"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateMedia(data),
    onSuccess: () => {
      toast.success("Media updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update media"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMedia(id),
    onSuccess: () => {
      toast.success("Media deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete media"),
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
    if (confirm(`Are you sure you want to delete the media reference "${title}"? This will break any pages using this image.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMedia = media?.filter(
    (m: any) => m.title?.toLowerCase().includes(search.toLowerCase()) || 
                m.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">Manage centralized Google Drive image references.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Media Reference
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
              placeholder="Search media..."
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
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <ImageIcon className="h-10 w-10 text-gray-300 mb-4" />
              <p>No media references found in the registry.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used In</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedia.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-24 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                        {item.file_id ? (
                          <img 
                            src={`https://lh3.googleusercontent.com/d/${item.file_id}`} 
                            alt={item.title || "Media"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-red-500 px-1 text-center leading-tight">Link broken or private</span>';
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.provider || "drive"} • {item.category || "Uncategorized"}</div>
                      <div className="text-xs text-gray-400 mt-1">Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={item.original_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        Open original <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      <div className="text-xs text-gray-400 mt-1 font-mono">{item.file_id?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        Unknown
                      </span>
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

      <MediaFormSheet 
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

function MediaFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        setFormData(initialData || {
          title: "",
          original_url: "",
          alt_text: "",
          category: "",
          width: "",
          height: ""
        });
        setPreviewId(initialData ? initialData.file_id : null);
      }
    }, [isOpen, initialData]);
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (field === "original_url") {
      setPreviewId(extractGoogleDriveId(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewId) {
      toast.error("Please provide a valid Google Drive URL");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle>{initialData ? "Edit Media Reference" : "Add Media Reference"}</SheetTitle>
          <SheetDescription>Store Google Drive image URLs to use across the website.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Media Title / Name *</Label>
              <Input required placeholder="e.g. Hero Background, President Photo" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
            </div>

            <div>
              <Label>Google Drive URL *</Label>
              <Input 
                required 
                placeholder="https://drive.google.com/file/d/..." 
                value={formData.original_url || ""} 
                onChange={(e) => handleChange("original_url", e.target.value)} 
                className={previewId ? "border-green-300" : (formData.original_url ? "border-red-300" : "")}
              />
              {formData.original_url && !previewId && (
                <p className="text-xs text-red-500 mt-1">Invalid Drive URL format. ID could not be extracted.</p>
              )}
            </div>

            {previewId && (
              <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="p-2 border-b border-gray-200 bg-white text-xs font-medium text-gray-500">Preview</div>
                <div className="p-4 flex justify-center items-center bg-gray-100/50 min-h-[150px]">
                  <img 
                    src={`https://lh3.googleusercontent.com/d/${previewId}`} 
                    alt="Preview" 
                    className="max-h-[200px] max-w-full rounded shadow-sm object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-center text-red-500 text-sm"><p>Preview could not be loaded.</p><p class="text-xs mt-1 text-gray-500">Ensure the file is publicly shared ("Anyone with the link").</p></div>';
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Category</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Event Gallery">Event Gallery</option>
                <option value="Team Photos">Team Photos</option>
                <option value="Blog Cover">Blog Cover</option>
                <option value="Site Assets">Site Assets</option>
                <option value="Sponsors">Sponsors</option>
              </select>
            </div>

            <div>
              <Label>Alt Text (For Accessibility & SEO)</Label>
              <Input value={formData.alt_text || ""} onChange={(e) => handleChange("alt_text", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Original Width (px)</Label>
                <Input type="number" value={formData.width || ""} onChange={(e) => handleChange("width", e.target.value)} />
              </div>
              <div>
                <Label>Original Height (px)</Label>
                <Input type="number" value={formData.height || ""} onChange={(e) => handleChange("height", e.target.value)} />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !previewId} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Media
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
