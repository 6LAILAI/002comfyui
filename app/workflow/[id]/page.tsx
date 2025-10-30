'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getWorkflowById } from '@/lib/workflows';
import { runWorkflow, getTaskStatus } from '@/lib/api';
import { saveWorkflowResult, updateWorkflowResult } from '@/lib/storage';
import { WorkflowNode, WorkflowResult } from '@/lib/types';
import { ArrowLeft, Play, Loader2, Upload, CheckCircle, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const workflow = getWorkflowById(workflowId);

  const [nodeValues, setNodeValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (workflow) {
      const initialValues: Record<string, string> = {};
      workflow.nodes.forEach(node => {
        const key = `${node.nodeId}-${node.fieldName}`;
        initialValues[key] = node.fieldValue;
      });
      setNodeValues(initialValues);
    }
  }, [workflow]);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>工作流未找到</CardTitle>
            <CardDescription>请返回首页选择其他工作流</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleImageUpload = async (nodeKey: string, file: File) => {
    setUploadingImage(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNodeValues(prev => ({ ...prev, [nodeKey]: base64String }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('图片上传失败，请重试');
    } finally {
      setUploadingImage(false);
    }
  };

  const parseSelectOptions = (fieldData: string | undefined): string[] => {
    if (!fieldData) return [];
    try {
      const parsed = JSON.parse(fieldData);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        return parsed[0];
      }
    } catch {
      return [];
    }
    return [];
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setCurrentResult(null);

    try {
      const nodeInfoList: WorkflowNode[] = workflow.nodes.map(node => {
        const key = `${node.nodeId}-${node.fieldName}`;
        return {
          ...node,
          fieldValue: nodeValues[key] || node.fieldValue
        };
      });

      const taskId = await runWorkflow(workflow.webappId, nodeInfoList);

      const result: WorkflowResult = {
        taskId,
        status: 'processing',
        createdAt: Date.now(),
        outputType: workflow.category.includes('视频') ? 'video' : 'image'
      };

      setCurrentResult(result);
      saveWorkflowResult(result);

      pollTaskStatus(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '运行失败，请重试');
      setIsRunning(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await getTaskStatus(taskId);

        if (status.status === 'completed' && status.outputUrl) {
          const updatedResult: WorkflowResult = {
            taskId,
            status: 'completed',
            outputUrl: status.outputUrl,
            createdAt: Date.now(),
            outputType: workflow.category.includes('视频') ? 'video' : 'image'
          };

          setCurrentResult(updatedResult);
          updateWorkflowResult(taskId, updatedResult);
          setIsRunning(false);
          return;
        }

        if (status.status === 'failed') {
          setError('任务执行失败');
          setIsRunning(false);
          updateWorkflowResult(taskId, { status: 'failed' });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setError('任务超时，请稍后查看结果');
          setIsRunning(false);
        }
      } catch (err) {
        setError('获取任务状态失败');
        setIsRunning(false);
      }
    };

    poll();
  };

  const renderNodeInput = (node: WorkflowNode) => {
    const key = `${node.nodeId}-${node.fieldName}`;
    const value = nodeValues[key] || '';

    switch (node.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{node.description}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingImage || isRunning}
                onClick={() => document.getElementById(`file-${key}`)?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImage ? '上传中...' : '选择图片'}
              </Button>
              <input
                id={`file-${key}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(key, file);
                }}
              />
            </div>
            {value && (
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <img src={value} alt="Preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{node.description}</Label>
            <Textarea
              id={key}
              value={value}
              onChange={(e) => setNodeValues(prev => ({ ...prev, [key]: e.target.value }))}
              disabled={isRunning}
              rows={4}
              className="resize-none"
            />
          </div>
        );

      case 'select':
        const options = parseSelectOptions(node.fieldData);
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{node.description}</Label>
            <Select
              value={value}
              onValueChange={(val) => setNodeValues(prev => ({ ...prev, [key]: val }))}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'number':
        const numberOptions = parseSelectOptions(node.fieldData);
        if (numberOptions.length > 0) {
          const min = Math.min(...numberOptions.map(Number));
          const max = Math.max(...numberOptions.map(Number));
          return (
            <div className="space-y-2">
              <Label htmlFor={key}>{node.description}</Label>
              <Input
                id={key}
                type="number"
                value={value}
                onChange={(e) => setNodeValues(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={isRunning}
                min={min}
                max={max}
              />
            </div>
          );
        }
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{node.description}</Label>
            <Input
              id={key}
              type="number"
              value={value}
              onChange={(e) => setNodeValues(prev => ({ ...prev, [key]: e.target.value }))}
              disabled={isRunning}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{node.description}</Label>
            <Input
              id={key}
              value={value}
              onChange={(e) => setNodeValues(prev => ({ ...prev, [key]: e.target.value }))}
              disabled={isRunning}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>参数设置</CardTitle>
                <CardDescription>配置工作流参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflow.nodes.map((node, index) => (
                  <div key={`${node.nodeId}-${node.fieldName}-${index}`}>
                    {renderNodeInput(node)}
                  </div>
                ))}

                <Button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      运行工作流
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription className="mt-2">{workflow.description}</CardDescription>
                  </div>
                  <Badge>{workflow.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={workflow.coverImage}
                    alt={workflow.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isRunning && !currentResult?.outputUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中
                  </CardTitle>
                  <CardDescription>正在处理您的请求，请稍候...</CardDescription>
                </CardHeader>
              </Card>
            )}

            {currentResult?.outputUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    生成完成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-lg overflow-hidden border">
                    {currentResult.outputType === 'video' ? (
                      <video
                        src={currentResult.outputUrl}
                        controls
                        className="w-full"
                        autoPlay
                        loop
                      />
                    ) : (
                      <img
                        src={currentResult.outputUrl}
                        alt="Generated result"
                        className="w-full"
                      />
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(currentResult.outputUrl, '_blank')}
                    >
                      {currentResult.outputType === 'video' ? <Video className="w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                      查看原图
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
