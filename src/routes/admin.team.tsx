import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUrlInput } from "@/components/admin/ImageUrlInput";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, AlertCircle } from "lucide-react";
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

export const Route = createFileRoute("/admin/team")({
  component: AdminTeam,
});

function AdminTeam() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => adminApi.getAdminData("team"),
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["admin", "team_roles"],
    queryFn: () => adminApi.getAdminData("team_roles"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createTeamMember(data),
    onSuccess: () => {
      toast.success("Team member added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to add team member"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateTeamMember(data),
    onSuccess: () => {
      toast.success("Team member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update team member"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTeamMember(id),
    onSuccess: () => {
      toast.success("Team member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to remove team member"),
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the team?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleName = (roleId: string) => {
    if (!roles) return roleId;
    const role = roles.find((r: any) => String(r.id) === String(roleId));
    return role ? role.role_name : roleId;
  };

  const filteredTeam = teamMembers?.filter(
    (member: any) => member.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isLoading = teamLoading || rolesLoading;

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="mt-1 text-sm text-gray-500">Manage board members, directors, and club members.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add Member
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
              placeholder="Search members..."
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
          ) : roles?.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
              <p>You need to create Team Roles before adding members.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/admin/team-roles'}
              >
                Manage Team Roles
              </Button>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No team members found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeam.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRoleName(member.role_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.year || "Current"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === "published" || member.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {member.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id, member.name)}>
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

      <TeamFormSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        initialData={editingItem}
        roles={roles || []}
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

function TeamFormSheet({ isOpen, onClose, initialData, roles, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        setFormData(initialData || {
          name: "",
          role_id: roles.length > 0 ? roles[0].id : "",
          year: "2023-24",
          short_description: "",
          bio: "",
          photo: "",
          email: "",
          phone: "",
          linkedin: "",
          instagram: "",
          display_order: "0",
          featured: "false",
          status: "active"
        });
      }
    }, [isOpen, initialData, roles]);
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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
        
        if (key.includes('name')) updates.name = value;
        else if (key === 'role') {
           const foundRole = roles?.find((r: any) => r.role_name.toLowerCase() === value.toLowerCase());
           if (foundRole) updates.role_id = foundRole.id;
        }
        else if (key.includes('year') || key.includes('tenure')) updates.year = value;
        else if (key.includes('photo')) {
          if (value.includes('http') || value.includes('drive.google')) {
            updates.photo = value;
          }
        }
        else if (key.includes('tagline') || key.includes('department') || key.includes('short')) updates.short_description = value;
        else if (key.includes('bio')) updates.bio = value;
        else if (key.includes('email')) updates.email = value;
        else if (key.includes('phone')) updates.phone = value;
        else if (key.includes('linkedin')) updates.linkedin = value;
        else if (key.includes('instagram')) updates.instagram = value;
        else if (key.includes('order')) updates.display_order = value.replace(/\D/g, '') || "0";
        else if (key === 'status') updates.status = value.toLowerCase() === 'active' ? 'active' : 'inactive';
        else if (key.includes('featured')) updates.featured = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' ? 'true' : 'false';
        
        currentKey = key;
      } else if (currentKey.includes('bio') && line.trim()) {
         updates.bio = (updates.bio || "") + "\n" + line.trim();
      }
    });
    
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_id) {
      toast.error("Please assign a role");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white text-black border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="text-black">{initialData ? "Edit Member" : "Add Team Member"}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <Label className="text-blue-800 font-semibold mb-2 block">Smart Auto-Fill</Label>
            <p className="text-xs text-blue-600 mb-2">Paste your team member details here (e.g. "Full Name: John Doe") and we'll automatically fill the form for you!</p>
            <Textarea 
              className="bg-white border-blue-200 text-slate-900 text-sm focus-visible:ring-blue-500" 
              placeholder="Full Name: Jane Doe&#10;Role: President&#10;Tenure Year: 2024-25&#10;Short Tagline: ..." 
              value={smartText}
              onChange={handleSmartPaste}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-black">Full Name *</Label>
                <Input className="text-black border-gray-300" required value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              
              <div>
                <Label className="text-black">Role *</Label>
                <select 
                  required
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                  value={formData.role_id || ""}
                  onChange={(e) => handleChange("role_id", e.target.value)}
                >
                  <option value="">Select Role</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.role_name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label className="text-black">Tenure Year (e.g., 2023-24)</Label>
                <Input className="text-black border-gray-300" value={formData.year || ""} onChange={(e) => handleChange("year", e.target.value)} />
              </div>
            </div>

            <ImageUrlInput 
              label="Photo (Google Drive URL)" 
              value={formData.photo || ""} 
              onChange={(val) => handleChange("photo", val)} 
            />

            <div>
              <Label className="text-black">Short Tagline / Department</Label>
              <Input className="text-black border-gray-300" value={formData.short_description || ""} onChange={(e) => handleChange("short_description", e.target.value)} />
            </div>

            <div>
              <Label className="text-black">Full Bio</Label>
              <Textarea className="min-h-[100px] text-black border-gray-300" value={formData.bio || ""} onChange={(e) => handleChange("bio", e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4 border-gray-200">
              <div>
                <Label className="text-black">Display Order</Label>
                <Input className="text-black border-gray-300" type="number" value={formData.display_order || "0"} onChange={(e) => handleChange("display_order", e.target.value)} />
              </div>
              <div>
                <Label className="text-black">Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                  value={formData.status || "active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <Label className="text-black">Featured (Board)</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
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
              Save Member
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
