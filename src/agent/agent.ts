import OpenAI from 'openai';
import { TasksApiClient } from '../api/tasksApi';
import { MessageHistory } from './messages';
import { tools, findToolByName, Tool } from '../tools';

export interface AgentConfig {
  openaiApiKey: string;
  tasksApiBaseUrl: string;
  model?: string;
  temperature?: number;
}

export class IntelligentAgent {
  private openai: OpenAI;
  private tasksApi: TasksApiClient;
  private messageHistory: MessageHistory;
  private model: string;
  private temperature: number;

  constructor(config: AgentConfig) {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
    this.tasksApi = new TasksApiClient(config.tasksApiBaseUrl);
    this.messageHistory = new MessageHistory();
    this.model = config.model || 'gpt-4-turbo-preview';
    this.temperature = config.temperature || 0.7;

    // Initialize with system message
    this.messageHistory.addSystemMessage(
      `Eres un agente inteligente de gestión de tareas. Tu función es ayudar a los usuarios a organizar y gestionar sus tareas usando la Tasks API.

Capacidades disponibles:
- Crear tareas y subtareas
- Descomponer tareas complejas en subtareas usando razonamiento con IA
- Actualizar detalles de tareas (título, descripción, estado)
- Iniciar tareas (marcar como in_progress)
- Completar tareas
- Eliminar tareas
- Mostrar el árbol completo de tareas con todas las subtareas

Valores de estado de tarea: 'pending', 'in_progress', 'completed'

Cuando un usuario te pida organizar algo (como "Organiza un viaje a Japón"), debes:
1. Crear una tarea raíz para el objetivo principal
2. Descomponer la tarea en subtareas accionables
3. Crear todas las subtareas en la API
4. Mostrar la estructura completa del árbol

Siempre sé útil, claro y proporciona contexto sobre las acciones que estás realizando. Usa las herramientas disponibles para lograr los objetivos del usuario. Responde siempre en español.`
    );
  }

  async processUserInput(userInput: string): Promise<string> {
    // Add user message
    this.messageHistory.addUserMessage(userInput);

    const maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;

      // Get the current messages
      const messages = this.messageHistory.getMessages();

      // Call OpenAI with tools
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        tools: tools.map((t) => t.tool),
        tool_choice: 'auto',
        temperature: this.temperature,
      });

      const message = completion.choices[0].message;

      // Add assistant message to history (including tool_calls if present)
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add the assistant message with tool_calls
        this.messageHistory.addAssistantMessageWithToolCalls(
          message.content || null,
          message.tool_calls
        );
      } else if (message.content) {
        // Add assistant message without tool_calls
        this.messageHistory.addAssistantMessage(message.content);
      }

      // If there are tool calls, execute them
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Process tool calls sequentially
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          // Find the tool
          const tool = findToolByName(toolName);
          if (!tool) {
            const errorMessage = JSON.stringify({
              success: false,
              error: `Herramienta "${toolName}" no encontrada`,
            });
            this.messageHistory.addToolMessage(toolCall.id, errorMessage);
            continue;
          }

          // Execute the tool
          try {
            let result: string;
            
            // Special handling for break_down_task which needs OpenAI client
            if (toolName === 'break_down_task') {
              result = await tool.execute(toolArgs, this.tasksApi, this.openai);
            } else {
              result = await tool.execute(toolArgs, this.tasksApi);
            }

            // Add tool result to message history
            this.messageHistory.addToolMessage(toolCall.id, result);
          } catch (error: any) {
            const errorMessage = JSON.stringify({
              success: false,
              error: error.message || 'Ocurrió un error desconocido',
            });
            this.messageHistory.addToolMessage(toolCall.id, errorMessage);
          }
        }

        // Continue the conversation loop to process tool results
        continue;
      }

      // No more tool calls, return the final response
      return message.content || 'No se generó respuesta';
    }

    return 'Se alcanzó el número máximo de iteraciones. Por favor intenta de nuevo con una solicitud más clara.';
  }

  async processWithReasoning(userInput: string): Promise<{
    response: string;
    reasoning: string[];
    toolCalls: Array<{ name: string; arguments: any; result: string }>;
  }> {
    const reasoning: string[] = [];
    const toolCalls: Array<{ name: string; arguments: any; result: string }> = [];

    // Reset message history for this conversation
    this.messageHistory.clear();
    this.messageHistory.addSystemMessage(
      `Eres un agente inteligente de gestión de tareas. Tu función es ayudar a los usuarios a organizar y gestionar sus tareas usando la Tasks API.

Capacidades disponibles:
- Crear tareas y subtareas
- Descomponer tareas complejas en subtareas usando razonamiento con IA
- Actualizar detalles de tareas (título, descripción, estado)
- Iniciar tareas (marcar como in_progress)
- Completar tareas
- Eliminar tareas
- Mostrar el árbol completo de tareas con todas las subtareas

Valores de estado de tarea: 'pending', 'in_progress', 'completed'

Cuando un usuario te pida organizar algo (como "Organiza un viaje a Japón"), debes:
1. Crear una tarea raíz para el objetivo principal
2. Descomponer la tarea en subtareas accionables
3. Crear todas las subtareas en la API
4. Mostrar la estructura completa del árbol

Siempre sé útil, claro y proporciona contexto sobre las acciones que estás realizando. Usa las herramientas disponibles para lograr los objetivos del usuario. Responde siempre en español.`
    );

    // Add user message
    this.messageHistory.addUserMessage(userInput);
    reasoning.push(`Received user input: "${userInput}"`);

    const maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;

      // Get the current messages
      const messages = this.messageHistory.getMessages();

      // Call OpenAI with tools
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        tools: tools.map((t) => t.tool),
        tool_choice: 'auto',
        temperature: this.temperature,
      });

      const message = completion.choices[0].message;

      // Add assistant message to history (including tool_calls if present)
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add the assistant message with tool_calls
        this.messageHistory.addAssistantMessageWithToolCalls(
          message.content || null,
          message.tool_calls
        );
        if (message.content) {
          reasoning.push(`Agent reasoning: ${message.content}`);
        }
      } else if (message.content) {
        // Add assistant message without tool_calls
        this.messageHistory.addAssistantMessage(message.content);
        reasoning.push(`Agent reasoning: ${message.content}`);
      }

      // If there are tool calls, execute them
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Process tool calls sequentially
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);

          reasoning.push(`Executing tool: ${toolName} with arguments: ${JSON.stringify(toolArgs)}`);

          // Find the tool
          const tool = findToolByName(toolName);
          if (!tool) {
            const errorMessage = JSON.stringify({
              success: false,
              error: `Herramienta "${toolName}" no encontrada`,
            });
            this.messageHistory.addToolMessage(toolCall.id, errorMessage);
            toolCalls.push({
              name: toolName,
              arguments: toolArgs,
              result: errorMessage,
            });
            continue;
          }

          // Execute the tool
          try {
            let result: string;
            
            // Special handling for break_down_task which needs OpenAI client
            if (toolName === 'break_down_task') {
              result = await tool.execute(toolArgs, this.tasksApi, this.openai);
            } else {
              result = await tool.execute(toolArgs, this.tasksApi);
            }

            // Parse result for display
            const parsedResult = JSON.parse(result);
            reasoning.push(`Tool result: ${parsedResult.message || parsedResult.error || 'Success'}`);

            toolCalls.push({
              name: toolName,
              arguments: toolArgs,
              result: result,
            });

            // Add tool result to message history
            this.messageHistory.addToolMessage(toolCall.id, result);
          } catch (error: any) {
            const errorMessage = JSON.stringify({
              success: false,
              error: error.message || 'Ocurrió un error desconocido',
            });
            reasoning.push(`Tool error: ${error.message || 'Error desconocido'}`);
            this.messageHistory.addToolMessage(toolCall.id, errorMessage);
            toolCalls.push({
              name: toolName,
              arguments: toolArgs,
              result: errorMessage,
            });
          }
        }

        // Continue the conversation loop to process tool results
        continue;
      }

      // No more tool calls, return the final response
      return {
        response: message.content || 'No se generó respuesta',
        reasoning,
        toolCalls,
      };
    }

    return {
      response: 'Se alcanzó el número máximo de iteraciones. Por favor intenta de nuevo con una solicitud más clara.',
      reasoning,
      toolCalls,
    };
  }

  clearHistory(): void {
    this.messageHistory.clear();
    this.messageHistory.addSystemMessage(
      `Eres un agente inteligente de gestión de tareas. Tu función es ayudar a los usuarios a organizar y gestionar sus tareas usando la Tasks API.

Capacidades disponibles:
- Crear tareas y subtareas
- Descomponer tareas complejas en subtareas usando razonamiento con IA
- Actualizar detalles de tareas (título, descripción, estado)
- Iniciar tareas (marcar como in_progress)
- Completar tareas
- Eliminar tareas
- Mostrar el árbol completo de tareas con todas las subtareas

Valores de estado de tarea: 'pending', 'in_progress', 'completed'

Cuando un usuario te pida organizar algo (como "Organiza un viaje a Japón"), debes:
1. Crear una tarea raíz para el objetivo principal
2. Descomponer la tarea en subtareas accionables
3. Crear todas las subtareas en la API
4. Mostrar la estructura completa del árbol

Siempre sé útil, claro y proporciona contexto sobre las acciones que estás realizando. Usa las herramientas disponibles para lograr los objetivos del usuario. Responde siempre en español.`
    );
  }
}

