import { TasksApiClient, UpdateTaskRequest } from '../api/tasksApi';
import { handleTaskError } from './errorHandler';

export interface UpdateTaskParams {
  taskId: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export const updateTaskTool = {
  type: 'function' as const,
  function: {
    name: 'update_task',
    description: 'Update an existing task. You can update the title, description, or status.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to update',
        },
        title: {
          type: 'string',
          description: 'New title for the task',
        },
        description: {
          type: 'string',
          description: 'New description for the task',
        },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed'],
          description: 'New status for the task (pending, in_progress, or completed)',
        },
      },
      required: ['taskId'],
    },
  },
};

export async function executeUpdateTask(
  params: UpdateTaskParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    const updates: UpdateTaskRequest = {};
    
    if (params.title !== undefined) {
      updates.title = params.title;
    }
    if (params.description !== undefined) {
      updates.description = params.description;
    }
    if (params.status !== undefined) {
      updates.status = params.status;
    }

    if (Object.keys(updates).length === 0) {
      return JSON.stringify({
        success: false,
        error: 'No se proporcionaron actualizaciones',
      });
    }

    const task = await apiClient.updateTask(params.taskId, updates);

    return JSON.stringify({
      success: true,
      message: `Tarea "${task.title}" actualizada exitosamente`,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
      },
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: handleTaskError(error, 'Error al actualizar la tarea'),
    });
  }
}

