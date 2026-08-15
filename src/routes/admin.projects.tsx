import { useState, useEffect } from "react";
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

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

function AdminProjects() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: () => adminApi.getAdminData("projects"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createProject(data),
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create project"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateProject(data),
    onSuccess: () => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProject(id),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete project"),
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

  const filteredProjects = projects?.filter(
    (p: any) => p.title?.toLowerCase().includes(search.toLowerCase()) || 
                p.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects & Events</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all club initiatives, events, and signature projects.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Project
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
              placeholder="Search projects..."
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
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No projects found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project: any) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500">{project.category} • {project.project_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.date || "TBD"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.status || "draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(project)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id, project.title)}>
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

      <ProjectFormSheet 
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

function ProjectFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});

  // Reset form when opened with new data
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...initialData } : {
        title: "",
        slug: "",
        category: "",
        project_type: "",
        short_description: "",
        full_description: "",
        date: "",
        start_time: "",
        end_time: "",
        venue: "",
        location: "",
        year: new Date().getFullYear().toString(),
        cover_image: "",
        status: "draft",
        featured: "false"
      });
      setSmartText("");
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const [smartText, setSmartText] = useState("");

  const handleSmartPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSmartText(text);
    if (!text.trim()) return;
    
    const lines = text.split('\n');
    const updates: any = {};
    let currentKey = "";
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const value = match[2].trim();
        
        if (key.includes('title')) updates.title = value;
        else if (key.includes('slug')) updates.slug = value;
        else if (key === 'category') updates.category = value;
        else if (key.includes('type')) updates.project_type = value;
        else if (key.includes('description')) updates.short_description = value;
        else if (key.includes('cover image')) {
          if (value.includes('http') || value.includes('drive.google')) {
            updates.cover_image = value;
          }
        }
        else if (key === 'date') {
          try {
             const d = new Date(value);
             if (!isNaN(d.getTime())) updates.date = d.toISOString().split('T')[0];
          } catch(e) {}
        }
        else if (key === 'start time' || key === 'end time') {
          const timeMatch = value.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const mins = timeMatch[2];
            const mod = timeMatch[3]?.toUpperCase();
            if (mod === 'PM' && hours < 12) hours += 12;
            if (mod === 'AM' && hours === 12) hours = 0;
            const parsedTime = `${hours.toString().padStart(2, '0')}:${mins}`;
            if (key === 'start time') updates.start_time = parsedTime;
            if (key === 'end time') updates.end_time = parsedTime;
          }
        }
        else if (key.includes('venue')) updates.venue = value;
        else if (key === 'status') updates.status = value.toLowerCase() === 'published' ? 'published' : 'draft';
        else if (key === 'featured') updates.featured = value.toLowerCase() === 'yes' ? 'true' : 'false';
        
        currentKey = key;
      } else if (currentKey.includes('description') && line.trim()) {
         updates.short_description = (updates.short_description || "") + "\n" + line.trim();
      }
    });
    
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="text-slate-900">{initialData ? "Edit Project" : "Create New Project"}</SheetTitle>
          <SheetDescription className="text-slate-500">Fill in the details for the event or project below.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <Label className="text-blue-800 font-semibold mb-2 block">Smart Auto-Fill</Label>
            <p className="text-xs text-blue-600 mb-2">Paste your project details here (e.g. "Project Title: Annam") and we'll automatically fill the form for you!</p>
            <Textarea 
              className="bg-white border-blue-200 text-slate-900 text-sm focus-visible:ring-blue-500" 
              placeholder="Project Title: Annam&#10;Category: Community Service&#10;Short Description: ..." 
              value={smartText}
              onChange={handleSmartPaste}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-900">Project Title *</Label>
              <Input required className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            
            <div>
              <Label className="text-slate-900">Slug (Optional, auto-generated if empty)</Label>
              <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.slug || ""} onChange={(e) => handleChange("slug", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.category || ""}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="Community Service">Community Service</option>
                  <option value="Professional Development">Professional Development</option>
                  <option value="Club Service">Club Service</option>
                  <option value="International Service">International Service</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-900">Project Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.project_type || ""}
                  onChange={(e) => handleChange("project_type", e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Signature Event">Signature Event</option>
                  <option value="Flagship Project">Flagship Project</option>
                  <option value="General Project">General Project</option>
                  <option value="Fundraiser">Fundraiser</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-slate-900">Short Description *</Label>
              <Textarea required className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.short_description || ""} onChange={(e) => handleChange("short_description", e.target.value)} />
            </div>
            
            <ImageUrlInput 
              label="Cover Image (Google Drive URL)" 
              value={formData.cover_image || ""} 
              onChange={(val) => handleChange("cover_image", val)} 
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-900">Date</Label>
                <Input type="date" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.date || ""} onChange={(e) => handleChange("date", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">Start Time</Label>
                <Input type="time" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.start_time || ""} onChange={(e) => handleChange("start_time", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">End Time</Label>
                <Input type="time" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.end_time || ""} onChange={(e) => handleChange("end_time", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-slate-900">Venue Name</Label>
              <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.venue || ""} onChange={(e) => handleChange("venue", e.target.value)} />
            </div>

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
              Save Project
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
