import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { IntelligentAgent } from '../agent/agent';
import { getEmojiForTask } from './emojiMapper';

// Load environment variables
dotenv.config();

async function formatTreeOutput(result: any): Promise<string> {
  try {
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    if (parsed.success && parsed.rawTree) {
      // Use the new emoji format
      return formatTaskTreeDisplay(parsed.rawTree);
    }
    if (parsed.success && parsed.tree) {
      // If we have formatted tree but no rawTree, try to parse it back
      // But prefer rawTree for better formatting
      return `\n📋 Árbol de tareas:\n${parsed.tree}\n`;
    }
  } catch {
    // If parsing fails, return original
  }
  return '';
}

function formatTree(task: any, indent: string = '', isLast: boolean = true): string {
  const connector = isLast ? '└── ' : '├── ';
  const statusIcon = task.status === 'completed' ? '✓' : '○';
  let result = `${indent}${connector}${statusIcon} ${task.title}`;
  
  if (task.description) {
    result += ` - ${task.description}`;
  }
  
  result += ` [${task.id}]\n`;

  if (task.subtasks && task.subtasks.length > 0) {
    const childIndent = indent + (isLast ? '    ' : '│   ');
    task.subtasks.forEach((subtask: any, index: number) => {
      const isLastChild = index === task.subtasks.length - 1;
      result += formatTree(subtask, childIndent, isLastChild);
    });
  }

  return result;
}

function formatTreeWithEmojis(task: any, indent: string = '', isLast: boolean = true, isRoot: boolean = false): string {
  let result = '';
  const taskId = task.id || task._id || '';
  
  if (isRoot) {
    // Root task - no connector, just title with ID and status
    result = `${task.title} [${taskId}] (${task.status})\n`;
  } else {
    // Subtask - with connector and emoji
    const connector = isLast ? '└── ' : '├── ';
    const emoji = getEmojiForTask(task.title);
    result = `${indent}${connector}${emoji}  ${task.title} [${taskId}] (${task.status})\n`;
  }

  // Handle subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const childIndent = isRoot ? '' : (indent + (isLast ? '    ' : '│   '));
    task.subtasks.forEach((subtask: any, index: number) => {
      const isLastChild = index === task.subtasks.length - 1;
      result += formatTreeWithEmojis(subtask, childIndent, isLastChild, false);
    });
  }

  return result;
}

function formatTaskTreeDisplay(tree: any): string {
  const title = `🗂️  Árbol de tareas: ${tree.title}`;
  
  let output = `\n${title}\n\n`;
  output += '='.repeat(50) + '\n';
  output += formatTreeWithEmojis(tree, '', true, true);
  output += '='.repeat(50) + '\n';
  
  return output;
}

function formatToolCall(toolCall: { name: string; arguments: any; result: string }): string {
  try {
    const result = typeof toolCall.result === 'string' ? JSON.parse(toolCall.result) : toolCall.result;
    const args = typeof toolCall.arguments === 'string' ? JSON.parse(toolCall.arguments) : toolCall.arguments;
    
    let output = `\n🔧 Tool: ${toolCall.name}\n`;
    output += `   Arguments: ${JSON.stringify(args, null, 2)}\n`;
    
    if (result.success) {
      output += `   ✓ ${result.message || 'Success'}\n`;
      
      // Special formatting for tree output
      if (result.tree) {
        output += `   ${result.tree.split('\n').join('\n   ')}\n`;
      }
    } else {
      output += `   ✗ Error: ${result.error || 'Unknown error'}\n`;
    }
    
    return output;
  } catch {
    return `\n🔧 Tool: ${toolCall.name}\n   Result: ${toolCall.result}\n`;
  }
}

async function startCLI() {
  console.log('\n🤖 Intelligent Task Management Agent\n');
  console.log('Welcome! I can help you organize and manage your tasks.\n');
  console.log('Type "exit" or "quit" to leave, or "clear" to reset the conversation.\n');

  // Validate environment variables
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const tasksApiBaseUrl = process.env.TASKS_API_BASE_URL;

  if (!openaiApiKey) {
    console.error('❌ Error: OPENAI_API_KEY is not set in .env file');
    process.exit(1);
  }

  if (!tasksApiBaseUrl) {
    console.error('❌ Error: TASKS_API_BASE_URL is not set in .env file');
    process.exit(1);
  }

  // Initialize agent
  const agent = new IntelligentAgent({
    openaiApiKey,
    tasksApiBaseUrl,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: process.env.OPENAI_TEMPERATURE ? parseFloat(process.env.OPENAI_TEMPERATURE) : 0.7,
  });

  // Main conversation loop
  while (true) {
    try {
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: 'You:',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Please enter a message or command.';
            }
            return true;
          },
        },
      ]);

      const input = userInput.trim();

      // Handle special commands
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        console.log('\n👋 Goodbye!\n');
        break;
      }

      if (input.toLowerCase() === 'clear') {
        agent.clearHistory();
        console.log('\n🔄 Conversation history cleared.\n');
        continue;
      }

      // Process user input
      console.log('\n🤔 Processing...\n');

      const result = await agent.processWithReasoning(input);

      // Display reasoning steps
      if (result.reasoning.length > 0) {
        console.log('📝 Reasoning Steps:');
        result.reasoning.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step}`);
        });
        console.log();
      }

      // Display tool calls
      if (result.toolCalls.length > 0) {
        console.log('🔧 Tool Executions:');
        result.toolCalls.forEach((toolCall) => {
          console.log(formatToolCall(toolCall));
        });
        console.log();
      }

      // Display final response
      console.log('🤖 Agent:', result.response);
      console.log();

      // Check if we need to display a task tree with emojis
      let displayedTree = false;
      let taskIdToShow: string | null = null;
      
      // First, check if show_tree was called
      for (const toolCall of result.toolCalls) {
        if (toolCall.name === 'show_tree') {
          const treeOutput = await formatTreeOutput(toolCall.result);
          if (treeOutput) {
            console.log(treeOutput);
            displayedTree = true;
          }
        }
      }

      // If we have create_task + break_down_task but no show_tree, get the tree automatically
      if (!displayedTree) {
        const createTaskCall = result.toolCalls.find(tc => tc.name === 'create_task');
        const breakDownCall = result.toolCalls.find(tc => tc.name === 'break_down_task');
        
        if (createTaskCall && breakDownCall) {
          try {
            const createResult = typeof createTaskCall.result === 'string' 
              ? JSON.parse(createTaskCall.result) 
              : createTaskCall.result;
            
            const breakDownResult = typeof breakDownCall.result === 'string'
              ? JSON.parse(breakDownCall.result)
              : breakDownCall.result;
            
            if (createResult.success && breakDownResult.success && createResult.task?.id) {
              taskIdToShow = createResult.task.id;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // If we found a task ID, fetch and display the tree
        if (taskIdToShow) {
          try {
            const { TasksApiClient } = await import('../api/tasksApi');
            const apiClient = new TasksApiClient(process.env.TASKS_API_BASE_URL || '');
            const tree = await apiClient.getTree(taskIdToShow);
            const formattedTree = formatTaskTreeDisplay(tree);
            console.log(formattedTree);
            console.log('\n¿Quieres añadir otra subtarea, completar alguna o ver el árbol de nuevo?');
            console.log();
          } catch (treeError) {
            // If tree fetch fails, ignore silently
          }
        }
      }

    } catch (error: any) {
      if (error.isTtyError) {
        console.error('\n❌ Error: Prompt couldn\'t be rendered in the current environment');
      } else {
        console.error('\n❌ Error:', error.message || error);
      }
      console.log();
    }
  }
}

// Start the CLI
if (require.main === module) {
  startCLI().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { startCLI };

