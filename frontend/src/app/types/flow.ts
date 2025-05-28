export enum NodeTypes {
  START = 'start',
  MESSAGE = 'message',
  TAG_CONTACT = 'tag_contact',
  HUMAN_TAKEOVER = 'human_takeover',
  WAIT = 'wait',
  GET_INPUT = 'get_input',
  CONDITION = 'condition',
}

export interface Button {
  type: 'quick_reply' | 'url';
  text: string;
  payload?: string;
  url?: string;
}

export interface MessageContent {
  text?: string;
  mediaUrl?: string;
  buttons?: Button[];
}

export interface NodeData {
  id: string;
  type: NodeTypes;
  name: string;
  content?: MessageContent;
  tagName?: string;
  durationSeconds?: number;
  inputType?: 'text' | 'email' | 'phone';
  prompt?: string;
  condition?: {
    type: 'button_payload' | 'input_valid' | 'attribute_equals';
    value: any;
  };
}

export interface Flow {
  id: string;
  instagramAccountId: string;
  name: string;
  description?: string;
  flowDefinition: {
    startNodeId: string;
    nodes: {
      id: string;
      type: NodeTypes;
      name: string;
      connections: {
        targetNodeId: string;
        condition?: {
          type: 'button_payload' | 'input_valid' | 'attribute_equals';
          value: any;
        };
      }[];
    }[];
  };
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface Trigger {
  id: string;
  flowId: string;
  type: 'welcome_message' | 'dm_keyword' | 'comment_keyword' | 'story_mention';
  keyword?: string;
  postPermalink?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 