import { TasksApiClient } from '../api/tasksApi';
import OpenAI from 'openai';
import {
  createTaskTool,
  executeCreateTask,
  CreateTaskParams,
} from './createTask';
import {
  breakDownTaskTool,
  executeBreakDownTask,
  BreakDownTaskParams,
} from './breakDownTask';
import {
  updateTaskTool,
  executeUpdateTask,
  UpdateTaskParams,
} from './updateTask';
import {
  completeTaskTool,
  executeCompleteTask,
  CompleteTaskParams,
} from './completeTask';
import {
  deleteTaskTool,
  executeDeleteTask,
  DeleteTaskParams,
} from './deleteTask';
import {
  showTreeTool,
  executeShowTree,
  ShowTreeParams,
} from './showTree';
import {
  startTaskTool,
  executeStartTask,
  StartTaskParams,
} from './startTask';

export interface Tool {
  name: string;
  tool: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  };
  execute: (params: any, apiClient: TasksApiClient, openaiClient?: OpenAI) => Promise<string>;
}

export const tools: Tool[] = [
  {
    name: 'create_task',
    tool: createTaskTool,
    execute: async (params: CreateTaskParams, apiClient: TasksApiClient) => {
      return executeCreateTask(params, apiClient);
    },
  },
  {
    name: 'break_down_task',
    tool: breakDownTaskTool,
    execute: async (
      params: BreakDownTaskParams,
      apiClient: TasksApiClient,
      openaiClient?: OpenAI
    ) => {
      if (!openaiClient) {
        throw new Error('OpenAI client is required for break_down_task');
      }
      return executeBreakDownTask(params, apiClient, openaiClient);
    },
  },
  {
    name: 'update_task',
    tool: updateTaskTool,
    execute: async (params: UpdateTaskParams, apiClient: TasksApiClient) => {
      return executeUpdateTask(params, apiClient);
    },
  },
  {
    name: 'complete_task',
    tool: completeTaskTool,
    execute: async (params: CompleteTaskParams, apiClient: TasksApiClient) => {
      return executeCompleteTask(params, apiClient);
    },
  },
  {
    name: 'delete_task',
    tool: deleteTaskTool,
    execute: async (params: DeleteTaskParams, apiClient: TasksApiClient) => {
      return executeDeleteTask(params, apiClient);
    },
  },
  {
    name: 'show_tree',
    tool: showTreeTool,
    execute: async (params: ShowTreeParams, apiClient: TasksApiClient) => {
      return executeShowTree(params, apiClient);
    },
  },
  {
    name: 'start_task',
    tool: startTaskTool,
    execute: async (params: StartTaskParams, apiClient: TasksApiClient) => {
      return executeStartTask(params, apiClient);
    },
  },
];

export const availableTools = tools.map((t) => t.tool);

export function findToolByName(name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}

