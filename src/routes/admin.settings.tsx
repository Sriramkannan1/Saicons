import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUrlInput } from "@/components/admin/ImageUrlInput";
import { toast } from "sonner";
import { Loader2, Save, Settings, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const DEFAULT_SETTINGS = {
  club_name: "Rotaract Club of Saibaba Colony",
  short_name: "SAICONS",
  group: "Group 1",
  ri_district: "RI District 3206",
  established: "1990–91",
  tagline: "Three decades of service, leadership and fellowship in Coimbatore.",
  description: "Youth leadership, community service and fellowship in Saibaba Colony, Coimbatore.",
  email: "",
  phone: "",
  address: "Saibaba Colony,\nCoimbatore,\nTamil Nadu,\nIndia",
  map_location: "",
  footer_text: "Rotaract Club of Saibaba Colony. All rights reserved.",
  logo_url: "",
  favicon_url: ""
};

function AdminSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [phones, setPhones] = useState<{id: number, name: string, number: string}[]>([]);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: () => adminApi.getAdminData("site_settings"),
  });

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
      settings.forEach((s: any) => {
        if (s.key) settingsMap[s.key] = s.value;
      });
      
      // Parse phones
      const parsedPhones: {id: number, name: string, number: string}[] = [];
      const phoneIndices = Object.keys(settingsMap)
        .filter(k => k.startsWith('phone_number_'))
        .map(k => parseInt(k.split('_')[2]));
        
      phoneIndices.forEach(idx => {
        if (settingsMap[`phone_number_${idx}`] || settingsMap[`phone_name_${idx}`]) {
          parsedPhones.push({
            id: idx,
            name: settingsMap[`phone_name_${idx}`] || "",
            number: settingsMap[`phone_number_${idx}`] || ""
          });
        }
      });
      
      // Default to at least one empty phone if none exist
      if (parsedPhones.length === 0) parsedPhones.push({ id: 1, name: "", number: "" });
      
      parsedPhones.sort((a,b) => a.id - b.id);
      setPhones(parsedPhones);
      setFormData(settingsMap);
    } else {
      setFormData({ ...DEFAULT_SETTINGS });
      setPhones([{ id: 1, name: "", number: "" }]);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (id: number, field: 'name'|'number', value: string) => {
    setPhones(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPhone = () => {
    const nextId = phones.length > 0 ? Math.max(...phones.map(p => p.id)) + 1 : 1;
    setPhones(prev => [...prev, { id: nextId, name: "", number: "" }]);
  };

  const removePhone = (id: number) => {
    setPhones(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = { ...formData };
      
      // Clear existing phone keys in case some were deleted
      Object.keys(dataToSave).forEach(k => {
         if (k.startsWith("phone_name_") || k.startsWith("phone_number_")) {
            dataToSave[k] = "";
         }
      });
      
      // Map active phones back to keys
      phones.forEach((p, i) => {
         dataToSave[`phone_name_${i+1}`] = p.name;
         dataToSave[`phone_number_${i+1}`] = p.number;
      });

      const keys = Object.keys(dataToSave);
      // Process sequentially to not overload Apps Script concurrent limits
      for (const key of keys) {
        await adminApi.updateSiteSetting(key, dataToSave[key]);
      }
      toast.success("Site settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "site_settings"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure global website content and contact information.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Core Identity */}
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-500" /> Core Identity
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <Label className="text-slate-900">Club Name</Label>
              <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.club_name || ""} onChange={(e) => handleChange("club_name", e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Short Name</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.short_name || ""} onChange={(e) => handleChange("short_name", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">Established Year</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.established || ""} onChange={(e) => handleChange("established", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Rotary Group</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.group || ""} onChange={(e) => handleChange("group", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">RI District</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.ri_district || ""} onChange={(e) => handleChange("ri_district", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-slate-900">Tagline / Hero Subtitle</Label>
              <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.tagline || ""} onChange={(e) => handleChange("tagline", e.target.value)} />
            </div>

            <div>
              <Label className="text-slate-900">Site SEO Description</Label>
              <Textarea className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Contact & Location</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-900">Email Address</Label>
                  <Input type="email" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.email || ""} onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-900">Phone Numbers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPhone} className="h-8 border-gray-300 text-slate-700">
                      <Plus className="h-3 w-3 mr-1" /> Add Number
                    </Button>
                  </div>
                  
                  {phones.map((phone, idx) => (
                    <div key={phone.id} className="flex gap-2 items-start">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div>
                          <Input 
                            placeholder="Holder Name (e.g. President)" 
                            className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" 
                            value={phone.name} 
                            onChange={(e) => handlePhoneChange(phone.id, 'name', e.target.value)} 
                          />
                        </div>
                        <div>
                          <Input 
                            type="tel" 
                            placeholder="Phone Number" 
                            className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" 
                            value={phone.number} 
                            onChange={(e) => handlePhoneChange(phone.id, 'number', e.target.value)} 
                          />
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removePhone(phone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-900">Physical Address</Label>
                <Textarea className="text-slate-900 border-gray-300 focus-visible:ring-blue-500 min-h-[100px]" value={formData.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
              </div>

              <div>
                <Label className="text-slate-900">Google Maps Location URL (Optional)</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.map_location || ""} onChange={(e) => handleChange("map_location", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Branding & Footer</h3>
            </div>
            <div className="p-6 space-y-6">
              <ImageUrlInput 
                label="Custom Logo (Drive URL)" 
                value={formData.logo_url || ""} 
                onChange={(val) => handleChange("logo_url", val)} 
              />
              
              <ImageUrlInput 
                label="Favicon (Drive URL)" 
                value={formData.favicon_url || ""} 
                onChange={(val) => handleChange("favicon_url", val)} 
              />

              <div>
                <Label className="text-slate-900">Footer Copyright Text</Label>
                <Input className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.footer_text || ""} onChange={(e) => handleChange("footer_text", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
