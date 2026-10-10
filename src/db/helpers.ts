import { db } from './index';
import type { Application, ApplicationStatus } from './schema';

export async function addApplication(appData: Omit<Application, 'id' | 'createdAt' | 'statusHistory'>) {
  const now = new Date().toISOString();
  
  const application: Application = {
    ...appData,
    createdAt: now,
    statusHistory: [
      { status: appData.status, date: now }
    ]
  };

  return await db.transaction('rw', db.applications, db.activities, async () => {
    const appId = await db.applications.add(application);
    
    await db.activities.add({
      applicationId: appId as number,
      company: appData.company,
      action: 'added',
      details: `Added ${appData.company} to ${appData.status}`,
      createdAt: now
    });
    
    return appId;
  });
}

export async function updateApplication(id: number, appData: Partial<Application>) {
  const now = new Date().toISOString();
  
  return await db.transaction('rw', db.applications, db.activities, async () => {
    const existing = await db.applications.get(id);
    if (!existing) throw new Error('Application not found');

    const statusChanged = appData.status && appData.status !== existing.status;
    let newHistory = existing.statusHistory;

    if (statusChanged) {
      newHistory = [...existing.statusHistory, { status: appData.status as ApplicationStatus, date: now }];
    }

    await db.applications.update(id, {
      ...appData,
      ...(statusChanged ? { statusHistory: newHistory } : {})
    });

    if (statusChanged) {
      await db.activities.add({
        applicationId: id,
        company: appData.company || existing.company,
        action: 'status_changed',
        details: `Moved ${appData.company || existing.company} to ${appData.status}`,
        createdAt: now
      });
    } else {
      await db.activities.add({
        applicationId: id,
        company: appData.company || existing.company,
        action: 'edited',
        details: `Updated details for ${appData.company || existing.company}`,
        createdAt: now
      });
    }
  });
}

export async function deleteApplication(id: number) {
  const now = new Date().toISOString();
  
  return await db.transaction('rw', db.applications, db.activities, async () => {
    const existing = await db.applications.get(id);
    if (!existing) return;

    await db.applications.delete(id);
    
    await db.activities.add({
      applicationId: id,
      company: existing.company,
      action: 'deleted',
      details: `Deleted application for ${existing.company}`,
      createdAt: now
    });
  });
}

export async function updateApplicationStatus(id: number, newStatus: ApplicationStatus) {
  return await updateApplication(id, { status: newStatus });
}
