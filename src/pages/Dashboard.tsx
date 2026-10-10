import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ApplicationStatus } from "@/db/schema";


export default function Dashboard() {
  const navigate = useNavigate();
  
  const applications = useLiveQuery(() => db.applications.toArray()) || [];
  const recentActivities = useLiveQuery(() => db.activities.orderBy('createdAt').reverse().limit(5).toArray()) || [];

  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const statuses: ApplicationStatus[] = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];

  const handleCardClick = (status: ApplicationStatus) => {
    navigate(`/applications?status=${status}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-poppins text-3xl font-bold">Welcome back! 👋</h2>
        <p className="text-muted-foreground mt-1">Here is a quick overview of your job search progress.</p>
      </div>

      {applications.length === 0 ? (
        <Card className="p-12 border-none shadow-sm text-center bg-card/90">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="bg-primary/10 p-4 rounded-full mb-6 text-primary">
              <Briefcase size={48} />
            </div>
            <h3 className="font-poppins text-2xl font-bold mb-2">Track your first application</h3>
            <p className="text-muted-foreground mb-8">
              Start tracking your job search journey. Keep all your applications, interview notes, and statuses in one place.
            </p>
            <Button onClick={() => navigate('/applications')} size="lg" className="gap-2 text-lg px-8">
              <Plus size={20} /> Add your first application
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statuses.map(status => (
              <Card 
                key={status} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-card/90 border-none"
                onClick={() => handleCardClick(status)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-poppins font-bold">{counts[status] || 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/90 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity found.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
