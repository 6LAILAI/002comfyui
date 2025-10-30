import { Workflow } from './types';

export const workflows: Workflow[] = [
  {
    id: '1982716342367330306',
    name: '图生视频',
    description: '将静态图片转换为动态视频，支持多种运动幅度和时长设置，适合创作短视频内容。',
    coverImage: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: '视频生成',
    webappId: '1982716342367330306',
    nodes: [
      {
        nodeId: '4',
        fieldName: 'image',
        fieldValue: '',
        description: '上传图像',
        type: 'image'
      },
      {
        nodeId: '1',
        fieldName: 'prompt',
        fieldValue: '（电影级面光：1.6），（光线追踪：1.4），（冷白皮漫感质感的光滑皮肤：1.6），冬季雪景背景，雪花飘落，阳光洒在雪地上。',
        description: '输入文本',
        type: 'text'
      },
      {
        nodeId: '1',
        fieldName: 'model',
        fieldData: '[[\"viduq2-pro\", \"viduq2-turbo\"], {\"default\": \"viduq2-turbo\"}]',
        fieldValue: 'viduq2-turbo',
        description: '模型',
        type: 'select'
      },
      {
        nodeId: '1',
        fieldName: 'resolution',
        fieldData: '[[\"720p\", \"1080p\"], {\"default\": \"720p\"}]',
        fieldValue: '720p',
        description: '分辨率',
        type: 'select'
      },
      {
        nodeId: '1',
        fieldName: 'duration',
        fieldData: '[[5, 8], {\"default\": 5}]',
        fieldValue: '5',
        description: '时长（秒）',
        type: 'number'
      },
      {
        nodeId: '1',
        fieldName: 'movement_amplitude',
        fieldData: '[[\"auto\", \"small\", \"medium\", \"large\"], {\"default\": \"auto\"}]',
        fieldValue: 'auto',
        description: '运动幅度',
        type: 'select'
      }
    ]
  },
  {
    id: 'workflow-2',
    name: '文字生成图片',
    description: '根据文字描述生成高质量图片，支持多种艺术风格和尺寸选择。',
    coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: '图片生成',
    webappId: '1982716342367330306',
    nodes: [
      {
        nodeId: '1',
        fieldName: 'prompt',
        fieldValue: '',
        description: '描述文本',
        type: 'text'
      },
      {
        nodeId: '1',
        fieldName: 'style',
        fieldData: '[[\"realistic\", \"anime\", \"artistic\"], {\"default\": \"realistic\"}]',
        fieldValue: 'realistic',
        description: '艺术风格',
        type: 'select'
      }
    ]
  },
  {
    id: 'workflow-3',
    name: '图片增强',
    description: '提升图片质量，支持超分辨率、降噪、色彩增强等功能。',
    coverImage: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: '图片处理',
    webappId: '1982716342367330306',
    nodes: [
      {
        nodeId: '1',
        fieldName: 'image',
        fieldValue: '',
        description: '上传图片',
        type: 'image'
      },
      {
        nodeId: '1',
        fieldName: 'enhancement_level',
        fieldData: '[[\"low\", \"medium\", \"high\"], {\"default\": \"medium\"}]',
        fieldValue: 'medium',
        description: '增强级别',
        type: 'select'
      }
    ]
  },
  {
    id: 'workflow-4',
    name: '视频风格转换',
    description: '将视频转换为不同艺术风格，如动漫、油画、素描等。',
    coverImage: 'https://images.pexels.com/photos/3569617/pexels-photo-3569617.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: '视频处理',
    webappId: '1982716342367330306',
    nodes: [
      {
        nodeId: '1',
        fieldName: 'video',
        fieldValue: '',
        description: '上传视频',
        type: 'image'
      },
      {
        nodeId: '1',
        fieldName: 'style',
        fieldData: '[[\"anime\", \"oil-painting\", \"sketch\"], {\"default\": \"anime\"}]',
        fieldValue: 'anime',
        description: '转换风格',
        type: 'select'
      }
    ]
  }
];

export function getWorkflowById(id: string): Workflow | undefined {
  return workflows.find(w => w.id === id);
}

export function getWorkflowsByCategory(category: string): Workflow[] {
  return workflows.filter(w => w.category === category);
}

export const categories = Array.from(new Set(workflows.map(w => w.category)));
