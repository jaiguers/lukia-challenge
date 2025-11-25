import { TasksApiClient } from '../api/tasksApi';
import { handleTaskError } from './errorHandler';

export interface DeleteTaskParams {
  taskId: string;
}

export const deleteTaskTool = {
  type: 'function' as const,
  function: {
    name: 'delete_task',
    description: 'Delete a task from the Tasks API. This will permanently remove the task and all its subtasks.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to delete',
        },
      },
      required: ['taskId'],
    },
  },
};

export async function executeDeleteTask(
  params: DeleteTaskParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    // First, verify the task exists and get its title
    let taskTitle = 'Unknown task';
    try {
      const task = await apiClient.getTask(params.taskId);
      taskTitle = task.title;
    } catch (error: any) {
      // If we can't get the task, it probably doesn't exist
      return JSON.stringify({
        success: false,
        error: handleTaskError(error, 'La tarea no existe'),
      });
    }

    await apiClient.deleteTask(params.taskId);

    return JSON.stringify({
      success: true,
      message: `Tarea "${taskTitle}" eliminada exitosamente`,
      taskId: params.taskId,
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: handleTaskError(error, 'Error al eliminar la tarea'),
    });
  }
}

