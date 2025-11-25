import { TasksApiClient } from '../api/tasksApi';
import { handleTaskError } from './errorHandler';

export interface CompleteTaskParams {
  taskId: string;
}

export const completeTaskTool = {
  type: 'function' as const,
  function: {
    name: 'complete_task',
    description: 'Mark a task as completed. This sets the task status to "completed". If the task has children, all children will be completed first, then the parent task.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to complete',
        },
      },
      required: ['taskId'],
    },
  },
};

/**
 * Recursively complete all subtasks of a task
 * This processes subtasks from the deepest level first (post-order traversal)
 */
async function completeAllSubtasks(
  task: any,
  apiClient: TasksApiClient
): Promise<{ completed: number; errors: string[] }> {
  let completed = 0;
  const errors: string[] = [];

  if (task.subtasks && task.subtasks.length > 0) {
    for (const subtask of task.subtasks) {
      try {
        const subtaskId = subtask.id || subtask._id;
        if (!subtaskId) {
          errors.push(`No se pudo obtener el ID de la subtarea "${subtask.title || 'desconocida'}"`);
          continue;
        }

        // First, recursively complete any nested subtasks
        if (subtask.subtasks && subtask.subtasks.length > 0) {
          const result = await completeAllSubtasks(subtask, apiClient);
          completed += result.completed;
          errors.push(...result.errors);
        }

        // Then complete the subtask itself
        await apiClient.updateTask(subtaskId, {
          status: 'completed',
        });
        completed++;
      } catch (error: any) {
        const errorMsg = handleTaskError(error, `Error al completar la subtarea "${subtask.title || 'desconocida'}"`);
        errors.push(errorMsg);
      }
    }
  }

  return { completed, errors };
}

export async function executeCompleteTask(
  params: CompleteTaskParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    // First, verify the task exists
    const task = await apiClient.getTask(params.taskId);
    const taskId = task.id || task._id || params.taskId;

    // Get the complete tree to check for children
    const tree = await apiClient.getTree(taskId);
    
    let completedSubtasks = 0;
    const errors: string[] = [];

    // If the task has subtasks, complete them all first
    if (tree.subtasks && tree.subtasks.length > 0) {
      const result = await completeAllSubtasks(tree, apiClient);
      completedSubtasks = result.completed;
      errors.push(...result.errors);
    }

    // Now complete the parent task
    const updatedTask = await apiClient.updateTask(taskId, {
      status: 'completed',
    });

    let message = `Tarea "${updatedTask.title}" marcada como completada`;
    if (completedSubtasks > 0) {
      message += ` junto con ${completedSubtasks} subtarea(s)`;
    }

    if (errors.length > 0) {
      message += `. Advertencias: ${errors.join('; ')}`;
    }

    return JSON.stringify({
      success: true,
      message,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
      },
      completedSubtasks,
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: handleTaskError(error, 'Error al completar la tarea'),
    });
  }
}

