import { WorkflowResult } from './types';

const STORAGE_KEY = 'workflow_results';

export function saveWorkflowResult(result: WorkflowResult): void {
  if (typeof window === 'undefined') return;

  const existing = getWorkflowResults();
  const updated = [result, ...existing].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getWorkflowResults(): WorkflowResult[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getWorkflowResultById(taskId: string): WorkflowResult | undefined {
  return getWorkflowResults().find(r => r.taskId === taskId);
}

export function updateWorkflowResult(taskId: string, updates: Partial<WorkflowResult>): void {
  if (typeof window === 'undefined') return;

  const results = getWorkflowResults();
  const index = results.findIndex(r => r.taskId === taskId);

  if (index !== -1) {
    results[index] = { ...results[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  }
}

export function clearWorkflowResults(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
