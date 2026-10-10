import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Search, ArrowUpDown, Briefcase, ExternalLink, Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { db } from "@/db";
import { addApplication, updateApplication, deleteApplication, updateApplicationStatus } from "@/db/helpers";
import type { Application, ApplicationStatus } from "@/db/schema";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STATUSES: (ApplicationStatus | "All")[] = ["All", "Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];
const WORK_TYPES = ["Remote", "Hybrid", "On-site"];

export function getStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case "Wishlist": return <Badge variant="secondary" className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100">Wishlist</Badge>;
    case "Applied": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Applied</Badge>;
    case "Interviewing": return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Interviewing</Badge>;
    case "Offer": return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Offer</Badge>;
    case "Rejected": return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Rejected</Badge>;
    default: return null;
  }
}

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") as ApplicationStatus | "All" || "All";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(initialStatus);
  const [sortBy, setSortBy] = useState<"newest" | "company">("newest");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Application>>({
    company: "", role: "", status: "Wishlist", jobLink: "", dateApplied: new Date().toISOString().split('T')[0], workType: "Remote", city: "", notes: ""
  });

  const applications = useLiveQuery(() => db.applications.toArray()) || [];

  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    acc["All"] = (acc["All"] || 0) + 1;
    return acc;
  }, { All: 0 } as Record<string, number>);

  const filtered = applications.filter((app) => {
    if (statusFilter !== "All" && app.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return app.company.toLowerCase().includes(q) || app.role.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "company") return a.company.localeCompare(b.company);
    return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
  });

  const handleOpenAdd = () => {
    setFormData({ company: "", role: "", status: "Wishlist", jobLink: "", dateApplied: new Date().toISOString().split('T')[0], workType: "Remote", city: "", notes: "" });
    setSelectedApp(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (app: Application) => {
    setFormData({ ...app });
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.status || !formData.dateApplied || !formData.workType) return;
    
    if (selectedApp?.id) {
      await updateApplication(selectedApp.id, formData);
    } else {
      await addApplication(formData as Omit<Application, 'id' | 'createdAt' | 'statusHistory'>);
    }
    setIsFormOpen(false);
    
    // Refresh selectedApp if it was open
    if (selectedApp?.id) {
       const updated = await db.applications.get(selectedApp.id);
       if (updated) {
         setSelectedApp(updated);
         setIsDetailOpen(true);
       }
    }
  };

  const handleDelete = async () => {
    if (selectedApp?.id) {
      await deleteApplication(selectedApp.id);
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedApp(null);
    }
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (selectedApp?.id) {
      await updateApplicationStatus(selectedApp.id, newStatus);
      const updated = await db.applications.get(selectedApp.id);
      if (updated) setSelectedApp(updated);
    }
  };

  const onTabChange = (val: string) => {
    setStatusFilter(val as any);
    setSearchParams(val === "All" ? {} : { status: val });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-poppins text-3xl font-bold">Applications</h2>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={16} />
          Add application
        </Button>
      </div>

      <Card className="p-6 bg-card/90 shadow-sm border-none">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search company or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2"><ArrowUpDown size={16} />Sort by</div>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="company">Company (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto pb-2">
          <Tabs value={statusFilter} onValueChange={onTabChange} className="w-full">
            <TabsList className="bg-muted/50 h-auto p-1 inline-flex w-max min-w-full sm:min-w-0">
              {STATUSES.map((s) => (
                <TabsTrigger key={s} value={s} className="py-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {s} <Badge variant="secondary" className="ml-2 bg-background dark:bg-muted text-xs">{counts[s] || 0}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="border rounded-md overflow-hidden bg-background">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length > 0 ? (
                sorted.map((app) => (
                  <TableRow 
                    key={app.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}
                  >
                    <TableCell className="font-medium">{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.city || app.workType}</TableCell>
                    <TableCell>{new Date(app.dateApplied).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Briefcase size={40} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium text-foreground mb-1">No applications yet</p>
                      <p className="text-sm mb-4">You haven't tracked any job applications matching this filter.</p>
                      <Button onClick={handleOpenAdd} variant="outline"><Plus size={16} className="mr-2" />Add your first application</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedApp ? 'Edit Application' : 'Add Application'}</DialogTitle>
            <DialogDescription>Fill in the details for this job application.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                <Input id="company" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                <Input id="role" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status <span className="text-red-500">*</span></Label>
                <Select value={formData.status} onValueChange={(val: any) => setFormData({...formData, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateApplied">Date Applied <span className="text-red-500">*</span></Label>
                <Input id="dateApplied" type="date" required value={formData.dateApplied} onChange={e => setFormData({...formData, dateApplied: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobLink">Job Link</Label>
              <Input id="jobLink" type="url" placeholder="https://" value={formData.jobLink} onChange={e => setFormData({...formData, jobLink: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Type <span className="text-red-500">*</span></Label>
                <Select value={formData.workType} onValueChange={(val: any) => setFormData({...formData, workType: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WORK_TYPES.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. New York, NY" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Any additional info..." rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start pr-4">
                  <div>
                    <DialogTitle className="text-2xl font-poppins">{selectedApp.role}</DialogTitle>
                    <DialogDescription className="text-lg font-medium text-foreground mt-1">{selectedApp.company}</DialogDescription>
                  </div>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 py-4 border-y">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} /> <span>Applied: {new Date(selectedApp.dateApplied).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} /> <span>{selectedApp.workType} {selectedApp.city ? `- ${selectedApp.city}` : ''}</span>
                  </div>
                  {selectedApp.jobLink && (
                    <div className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                      <ExternalLink size={16} /> <a href={selectedApp.jobLink} target="_blank" rel="noreferrer">View Job Posting</a>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={selectedApp.status} onValueChange={handleStatusChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedApp.notes && (
                <div className="py-2">
                  <Label className="mb-2 block">Notes</Label>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{selectedApp.notes}</p>
                </div>
              )}

              <div className="py-2">
                <Label className="mb-2 block">Status History</Label>
                <div className="space-y-2">
                  {selectedApp.statusHistory?.map((history, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{history.status}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">{new Date(history.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center sm:justify-between pt-4">
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2">
                  <Trash2 size={16} /> Delete
                </Button>
                <Button variant="outline" onClick={() => handleOpenEdit(selectedApp)} className="gap-2">
                  <Edit size={16} /> Edit Details
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application for {selectedApp?.company}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
