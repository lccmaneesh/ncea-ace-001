import { Report, Subject, SessionData } from '../types';

const REPORTS_KEY = 'ncea-ace-reports';

/**
 * Retrieves all saved reports from local storage.
 * @returns An array of reports, or an empty array if none are found.
 */
export function getReports(): Report[] {
  try {
    const reportsJson = localStorage.getItem(REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error("Failed to parse reports from localStorage", error);
    return [];
  }
}

/**
 * Saves a new report to local storage.
 * @param reportData - The report data to save, excluding id and date.
 * @returns The newly created report with id and date.
 */
export function saveReport(reportData: {
  subject: Subject;
  topicName: string;
  sessionData: SessionData[];
}): Report {
  const reports = getReports();
  const newReport: Report = {
    ...reportData,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  
  // Add the new report to the beginning of the list
  reports.unshift(newReport);
  
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error("Failed to save report to localStorage", error);
  }
  
  return newReport;
}
