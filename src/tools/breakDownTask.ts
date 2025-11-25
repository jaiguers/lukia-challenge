import OpenAI from 'openai';
import { TasksApiClient } from '../api/tasksApi';

export interface BreakDownTaskParams {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
}

export const breakDownTaskTool = {
  type: 'function' as const,
  function: {
    name: 'break_down_task',
    description: 'Break down a task into subtasks using AI reasoning. This tool will analyze the task and generate a list of subtasks that need to be created.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to break down',
        },
        taskTitle: {
          type: 'string',
          description: 'The title of the task to break down',
        },
        taskDescription: {
          type: 'string',
          description: 'Optional description of the task to break down',
        },
      },
      required: ['taskId', 'taskTitle'],
    },
  },
};

export async function executeBreakDownTask(
  params: BreakDownTaskParams,
  apiClient: TasksApiClient,
  openaiClient: OpenAI
): Promise<string> {
  try {
    const prompt = `Eres un asistente de planificación de tareas. Dada la siguiente tarea, descomponla en 3-8 subtareas específicas y accionables.

Título de la Tarea: ${params.taskTitle}
${params.taskDescription ? `Descripción de la Tarea: ${params.taskDescription}` : ''}

Por favor analiza esta tarea y crea una lista de subtareas que ayuden a completarla. Cada subtarea debe ser:
1. Específica y accionable
2. Clara y concisa
3. Ordenada lógicamente (algunas pueden depender de otras)

Devuelve tu respuesta como un arreglo JSON de objetos con esta estructura exacta:
[
  {
    "title": "Título de la subtarea aquí",
    "description": "Descripción breve de lo que se debe hacer"
  },
  ...
]

Solo devuelve el arreglo JSON, sin texto adicional ni explicaciones.`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente útil de planificación de tareas. Siempre devuelve arreglos JSON válidos.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parse the JSON response
    let subtasks: Array<{ title: string; description?: string }>;
    try {
      subtasks = JSON.parse(content.trim());
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
      if (jsonMatch) {
        subtasks = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Error al parsear el JSON de subtareas');
      }
    }

    if (!Array.isArray(subtasks)) {
      throw new Error('Las subtareas deben ser un arreglo');
    }

    // Create subtasks in the API
    const createdSubtasks = [];
    const errors = [];

    for (const subtask of subtasks) {
      try {
        const created = await apiClient.createTask({
          title: subtask.title,
          description: subtask.description,
          parentId: params.taskId, // Set parentId to the root task ID
        });
        const createdId = created.id || (created as any)._id || '';
        createdSubtasks.push({
          id: createdId,
          title: created.title,
          description: created.description,
        });
      } catch (error: any) {
        errors.push({
          title: subtask.title,
          error: error.response?.data?.message || error.message,
        });
      }
    }

    return JSON.stringify({
      success: true,
      message: `Tarea descompuesta en ${createdSubtasks.length} subtareas`,
      subtasksCreated: createdSubtasks.length,
      subtasks: createdSubtasks,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: error.message || 'Error al descomponer la tarea',
    });
  }
}

