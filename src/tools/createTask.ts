import { TasksApiClient, CreateTaskRequest } from '../api/tasksApi';

export interface CreateTaskParams {
  title: string;
  description?: string;
  parentId?: string;
}

export const createTaskTool = {
  type: 'function' as const,
  function: {
    name: 'create_task',
    description: 'Create a new task in the Tasks API. Use this to create both root tasks and subtasks.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the task',
        },
        description: {
          type: 'string',
          description: 'Optional description of the task',
        },
        parentId: {
          type: 'string',
          description: 'Optional ID of the parent task if this is a subtask',
        },
      },
      required: ['title'],
    },
  },
};

export async function executeCreateTask(
  params: CreateTaskParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    const taskRequest: CreateTaskRequest = {
      title: params.title,
      description: params.description,
      parentId: params.parentId,
    };

    const task = await apiClient.createTask(taskRequest);
    const taskId = task.id || (task as any)._id || '';

    return JSON.stringify({
      success: true,
      message: `Tarea "${task.title}" creada exitosamente`,
      task: {
        id: taskId,
        title: task.title,
        description: task.description,
        status: task.status,
        parentId: task.parentId,
      },
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: error.response?.data?.message || error.message || 'Error al crear la tarea',
    });
  }
}

