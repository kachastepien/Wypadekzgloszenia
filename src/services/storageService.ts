import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1ba4d8f6`;

export interface ReportData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const storageService = {
  async saveReport(data: ReportData): Promise<{ success: boolean; id: string; data: ReportData }> {
    try {
      const response = await fetch(`${BASE_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error saving report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save report:', error);
      throw error;
    }
  },

  async getReport(id: string): Promise<ReportData> {
    try {
      const response = await fetch(`${BASE_URL}/report/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch report:', error);
      throw error;
    }
  },

  async listReports(): Promise<ReportData[]> {
    try {
      const response = await fetch(`${BASE_URL}/reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error listing reports: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to list reports:', error);
      throw error;
    }
  }
};
