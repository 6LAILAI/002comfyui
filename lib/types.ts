export interface WorkflowNode {
  nodeId: string;
  fieldName: string;
  fieldValue: string;
  fieldData?: string;
  description: string;
  type?: 'text' | 'image' | 'select' | 'number';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: string;
  webappId: string;
  nodes: WorkflowNode[];
}

export interface WorkflowResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  outputType?: 'image' | 'video';
  createdAt: number;
}

export interface ApiResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface TaskStatusResponse {
  code: number;
  msg: string;
  data: {
    status: string;
    outputUrl?: string;
  };
}
