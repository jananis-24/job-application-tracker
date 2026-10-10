import Dexie, { type Table } from 'dexie';
import type { Application, Activity } from './schema';

export class JobTrackerDB extends Dexie {
  applications!: Table<Application, number>;
  activities!: Table<Activity, number>;

  constructor() {
    super('JobTrackerDB');
    this.version(1).stores({
      applications: '++id, company, role, status, dateApplied',
      activities: '++id, applicationId, createdAt'
    });
  }
}

export const db = new JobTrackerDB();
