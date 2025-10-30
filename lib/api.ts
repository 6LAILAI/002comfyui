import { WorkflowNode, ApiResponse, TaskStatusResponse } from './types';

const API_BASE_URL = 'https://www.runninghub.cn/task/openapi/ai-app';
const API_KEY = '88b51bbd20fb4dfe8a8082b580ab4838';

export async function runWorkflow(
  webappId: string,
  nodeInfoList: WorkflowNode[]
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/run`, {
    method: 'POST',
    headers: {
      'Host': 'www.runninghub.cn',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webappId,
      apiKey: API_KEY,
      nodeInfoList: nodeInfoList.map(node => ({
        nodeId: node.nodeId,
        fieldName: node.fieldName,
        fieldValue: node.fieldValue,
        ...(node.fieldData && { fieldData: node.fieldData }),
        description: node.description
      }))
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(data.msg || 'API request failed');
  }

  return data.data.taskId;
}

export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse['data']> {
  const response = await fetch(`${API_BASE_URL}/task-status?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Host': 'www.runninghub.cn',
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get task status: ${response.statusText}`);
  }

  const data: TaskStatusResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to get task status');
  }

  return data.data;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Host': 'www.runninghub.cn',
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to upload image');
  }

  return data.data.fileUrl || data.data.fileName;
}
