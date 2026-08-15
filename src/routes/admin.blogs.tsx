import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUrlInput } from "@/components/admin/ImageUrlInput";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
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

export const Route = createFileRoute("/admin/blogs")({
  component: AdminBlogs,
});

function AdminBlogs() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["admin", "blogs"],
    queryFn: () => adminApi.getAdminData("blogs"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createBlog(data),
    onSuccess: () => {
      toast.success("Blog created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create blog"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateBlog(data),
    onSuccess: () => {
      toast.success("Blog updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update blog"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlog(id),
    onSuccess: () => {
      toast.success("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete blog"),
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
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBlogs = blogs?.filter(
    (b: any) => b.title?.toLowerCase().includes(search.toLowerCase()) || 
                b.author?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="mt-1 text-sm text-gray-500">Manage blog posts, articles, and club stories.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Blog Post
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
              placeholder="Search blogs..."
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
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No blog posts found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog: any) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                      <div className="text-sm text-gray-500">{blog.published_date || "No date"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.author || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {blog.status || "draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(blog)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id, blog.title)}>
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

      <BlogFormSheet 
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

function BlogFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        setFormData(initialData || {
          title: "",
          slug: "",
          category: "",
          author: "",
          excerpt: "",
          content: "",
          cover_image: "",
          published_date: new Date().toISOString().split("T")[0],
          status: "draft",
          featured: "false"
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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="text-slate-900">{initialData ? "Edit Blog Post" : "Create New Blog Post"}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-slate-900">Title *</Label>
              <Input required className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Author</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.author || ""} onChange={(e) => handleChange("author", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">Published Date</Label>
                <Input type="date" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.published_date || ""} onChange={(e) => handleChange("published_date", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-slate-900">Excerpt *</Label>
              <Textarea required className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.excerpt || ""} onChange={(e) => handleChange("excerpt", e.target.value)} />
            </div>

            <div>
              <Label className="text-slate-900">Full Content (Markdown/HTML) *</Label>
              <Textarea required className="min-h-[200px] font-mono text-sm text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.content || ""} onChange={(e) => handleChange("content", e.target.value)} />
            </div>
            
            <ImageUrlInput 
              label="Cover Image (Google Drive URL)" 
              value={formData.cover_image || ""} 
              onChange={(val) => handleChange("cover_image", val)} 
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.status || "draft"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-900">Featured</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.featured || "false"}
                  onChange={(e) => handleChange("featured", e.target.value)}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          </div>

          <SheetFooter className="mt-8 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Blog
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
