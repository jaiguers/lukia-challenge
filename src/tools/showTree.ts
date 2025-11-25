import { TasksApiClient } from '../api/tasksApi';
import { handleTaskError } from './errorHandler';

export interface ShowTreeParams {
  taskId: string;
}

export const showTreeTool = {
  type: 'function' as const,
  function: {
    name: 'show_tree',
    description: 'Get and display the complete task tree including all subtasks. Use this to show the hierarchical structure of a task.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the root task to get the tree for',
        },
      },
      required: ['taskId'],
    },
  },
};

function formatTree(task: any, indent: string = '', isLast: boolean = true): string {
  const connector = isLast ? '└── ' : '├── ';
  let statusIcon = '○';
  if (task.status === 'completed') {
    statusIcon = '✓';
  } else if (task.status === 'in_progress') {
    statusIcon = '⟳';
  }
  let result = `${indent}${connector}${statusIcon} ${task.title}`;
  
  if (task.description) {
    result += ` - ${task.description}`;
  }
  
  result += ` [${task.id}] (${task.status})\n`;

  if (task.subtasks && task.subtasks.length > 0) {
    const childIndent = indent + (isLast ? '    ' : '│   ');
    task.subtasks.forEach((subtask: any, index: number) => {
      const isLastChild = index === task.subtasks.length - 1;
      result += formatTree(subtask, childIndent, isLastChild);
    });
  }

  return result;
}

export async function executeShowTree(
  params: ShowTreeParams,
  apiClient: TasksApiClient
): Promise<string> {
  try {
    const tree = await apiClient.getTree(params.taskId);
    
    const formattedTree = formatTree(tree);
    let statusIcon = '○';
    if (tree.status === 'completed') {
      statusIcon = '✓';
    } else if (tree.status === 'in_progress') {
      statusIcon = '⟳';
    }

    return JSON.stringify({
      success: true,
      message: `Árbol de tareas para "${tree.title}"`,
      tree: formattedTree,
      task: {
        id: tree.id,
        title: tree.title,
        status: tree.status,
        statusIcon,
        hasSubtasks: tree.subtasks && tree.subtasks.length > 0,
        subtaskCount: tree.subtasks ? tree.subtasks.length : 0,
      },
      rawTree: tree,
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: handleTaskError(error, 'Error al obtener el árbol de tareas'),
    });
  }
}

