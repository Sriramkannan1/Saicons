import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, HelpCircle } from "lucide-react";
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

export const Route = createFileRoute("/admin/faq")({
  component: AdminFAQ,
});

function AdminFAQ() {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin", "faq"],
    queryFn: () => adminApi.getAdminData("faq"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createFAQ(data),
    onSuccess: () => {
      toast.success("FAQ created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to create FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateFAQ(data),
    onSuccess: () => {
      toast.success("FAQ updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
      setIsSheetOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFAQ(id),
    onSuccess: () => {
      toast.success("FAQ deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete FAQ"),
  });

  const openCreate = () => {
    setEditingItem(null);
    setIsSheetOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, question: string) => {
    if (confirm(`Are you sure you want to delete the question "${question}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const togglePublish = (item: any) => {
    const isPublished = String(item.published) === "true";
    updateMutation.mutate({ ...item, published: isPublished ? "false" : "true" });
  };

  const filteredFaqs = faqs?.filter(
    (f: any) => f.question?.toLowerCase().includes(search.toLowerCase()) || 
                f.answer?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <AdminLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the public FAQ section items.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
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
              placeholder="Search FAQs..."
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
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <HelpCircle className="h-10 w-10 text-gray-300 mb-4" />
              <p>No FAQ entries found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question & Answer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaqs.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">{item.question}</div>
                      <div className="text-xs text-gray-500 max-w-xl line-clamp-2">{item.answer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.display_order || "0"}
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.question)}>
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

      <FAQFormSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        initialData={editingItem}
        onSubmit={async (data) => {
          if (Array.isArray(data)) {
            // Batch processing
            try {
              for (const item of data) {
                await adminApi.createFAQ(item);
              }
              toast.success(`${data.length} FAQs created successfully!`);
              queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
              setIsSheetOpen(false);
            } catch (error: any) {
              toast.error(error.message || "Failed to batch create FAQs");
            }
          } else if (editingItem) {
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

function FAQFormSheet({ isOpen, onClose, initialData, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState<any>({});
  const [smartText, setSmartText] = useState("");
  const [batchFaqs, setBatchFaqs] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...initialData } : {
        question: "",
        answer: "",
        category: "",
        display_order: "0",
        published: "true"
      });
      setSmartText("");
      setBatchFaqs([]);
    }
  }, [isOpen, initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSmartPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSmartText(text);
    if (!text.trim()) {
      setBatchFaqs([]);
      return;
    }
    
    // Split by "Question:" to handle multiple blocks
    const blocks = text.split(/(?=Question:)/i);
    const parsedFaqs: any[] = [];
    
    blocks.forEach(block => {
      if (!block.trim()) return;
      const lines = block.split('\n');
      const faq: any = { category: "", display_order: "0", published: "true" };
      let currentKey = "";
      
      lines.forEach(line => {
        const match = line.match(/^([^:]+):\s*(.*)$/i);
        if (match) {
          const key = match[1].trim().toLowerCase();
          const value = match[2].trim();
          if (key === 'question') faq.question = value;
          else if (key === 'answer') faq.answer = value;
          currentKey = key;
        } else if (currentKey === 'answer' && line.trim()) {
          faq.answer += "\n" + line.trim();
        }
      });
      
      if (faq.question && faq.answer) {
        parsedFaqs.push(faq);
      }
    });
    
    setBatchFaqs(parsedFaqs);
    // If only one is parsed, auto-fill the form below
    if (parsedFaqs.length === 1) {
       setFormData((prev: any) => ({ ...prev, question: parsedFaqs[0].question, answer: parsedFaqs[0].answer }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFaqs.length > 1) {
      onSubmit(batchFaqs);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-gray-200">
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="text-slate-900">{initialData ? "Edit FAQ" : "Create FAQ"}</SheetTitle>
          <SheetDescription className="text-slate-500">This question will appear in the FAQ accordion.</SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!initialData && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <Label className="text-blue-800 font-semibold mb-2 block">Smart Auto-Fill (Batch Supported)</Label>
              <p className="text-xs text-blue-600 mb-2">Paste one or multiple FAQs here (Question: ... Answer: ...). We will automatically process them!</p>
              <Textarea 
                className="bg-white border-blue-200 text-slate-900 text-sm focus-visible:ring-blue-500" 
                placeholder="Question: What is Rotaract?&#10;Answer: Rotaract is...&#10;&#10;Question: Next question?&#10;Answer: ..." 
                value={smartText}
                onChange={handleSmartPaste}
                rows={4}
              />
              {batchFaqs.length > 1 && (
                <div className="mt-3 bg-green-50 border border-green-200 text-green-800 p-2 rounded text-xs font-semibold">
                  Batch Mode Active: Successfully parsed {batchFaqs.length} FAQs! Submitting will save all of them at once.
                </div>
              )}
            </div>
          )}

          <div className={`space-y-4 ${batchFaqs.length > 1 ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <Label className="text-slate-900">Question *</Label>
              <Input required={batchFaqs.length <= 1} placeholder="e.g. How do I join?" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.question || ""} onChange={(e) => handleChange("question", e.target.value)} />
            </div>

            <div>
              <Label className="text-slate-900">Answer *</Label>
              <Textarea 
                required={batchFaqs.length <= 1}
                className="min-h-[150px] text-slate-900 border-gray-300 focus-visible:ring-blue-500"
                placeholder="To join the club, you can..." 
                value={formData.answer || ""} 
                onChange={(e) => handleChange("answer", e.target.value)} 
              />
            </div>

            <div>
              <Label className="text-slate-900">Category (Optional)</Label>
              <Input placeholder="e.g. Membership, General" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.category || ""} onChange={(e) => handleChange("category", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-900">Display Order</Label>
                <Input type="number" className="text-slate-900 border-gray-300 focus-visible:ring-blue-500" value={formData.display_order || "0"} onChange={(e) => handleChange("display_order", e.target.value)} />
              </div>
              <div>
                <Label className="text-slate-900">Published</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 text-slate-900 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              Save FAQ
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
