import { TasksApiClient } from '../api/tasksApi';
import { handleTaskError } from './errorHandler';

export interface StartTaskParams {
  taskId: string;
}

export const startTaskTool = {
  type: 'function' as const,
  function: {
    name: 'start_task',
    description: 'Mark a task as in progress. This sets the task status to "in_progress".',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to start',
        },
      },
      required: ['taskId'],
    },
  },
};

export async function executeStartTask(
  params: StartTaskParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    const task = await apiClient.updateTask(params.taskId, {
      status: 'in_progress',
    });

    return JSON.stringify({
      success: true,
      message: `Tarea "${task.title}" marcada como en progreso`,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
      },
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: handleTaskError(error, 'Error al iniciar la tarea'),
    });
  }
}

