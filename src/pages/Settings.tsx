import { useState, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { db } from "@/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [isClearOpen, setIsClearOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const apps = await db.applications.toArray();
    const acts = await db.activities.toArray();
    const data = { applications: apps, activities: acts, version: "1.0.0" };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.applications && json.activities) {
          await db.transaction('rw', db.applications, db.activities, async () => {
            await db.applications.clear();
            await db.activities.clear();
            await db.applications.bulkAdd(json.applications);
            await db.activities.bulkAdd(json.activities);
          });
          alert("Data imported successfully!");
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse the backup file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleClear = async () => {
    await db.applications.clear();
    await db.activities.clear();
    setIsClearOpen(false);
    alert("All data cleared successfully.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-poppins text-3xl font-bold mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your app preferences and data.</p>
      </div>

      {/* Appearance */}
      <Card className="bg-card/90 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
            </div>
            <Switch 
              checked={theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card/90 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or delete your application data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export Backup</Label>
              <p className="text-sm text-muted-foreground">Download a JSON file of all your data.</p>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download size={16} /> Export
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div className="space-y-0.5">
              <Label>Import Backup</Label>
              <p className="text-sm text-muted-foreground">Restore data from a JSON backup file. This will replace current data.</p>
            </div>
            <div>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload size={16} /> Import
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div className="space-y-0.5">
              <Label className="text-destructive">Clear All Data</Label>
              <p className="text-sm text-muted-foreground">Permanently delete all applications and activity logs.</p>
            </div>
            <Button variant="destructive" onClick={() => setIsClearOpen(true)} className="gap-2">
              <Trash2 size={16} /> Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-card/90 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info size={20} /> About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">App Name:</span> Job Application Tracker</p>
            <p><span className="font-medium">Version:</span> 1.0.0</p>
            <p className="text-muted-foreground mt-2">A simple, local-first tool for organizing your job search.</p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your job applications and activity history from this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
