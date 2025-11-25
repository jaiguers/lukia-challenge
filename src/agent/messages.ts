import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type Message = ChatCompletionMessageParam;

export class MessageHistory {
  private messages: Message[] = [];

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  addSystemMessage(content: string): void {
    this.messages.push({
      role: 'system',
      content,
    });
  }

  addUserMessage(content: string): void {
    this.messages.push({
      role: 'user',
      content,
    });
  }

  addAssistantMessage(content: string): void {
    this.messages.push({
      role: 'assistant',
      content,
    });
  }

  addAssistantMessageWithToolCalls(
    content: string | null,
    toolCalls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>
  ): void {
    const message: any = {
      role: 'assistant',
    };

    if (content !== null && content !== undefined) {
      message.content = content;
    }

    if (toolCalls && toolCalls.length > 0) {
      message.tool_calls = toolCalls;
    }

    this.messages.push(message as Message);
  }

  addToolMessage(toolCallId: string, content: string): void {
    this.messages.push({
      role: 'tool',
      tool_call_id: toolCallId,
      content,
    });
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  getLastMessage(): Message | undefined {
    return this.messages[this.messages.length - 1];
  }
}

