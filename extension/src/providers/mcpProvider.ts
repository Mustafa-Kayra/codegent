type ToolHandler = (params: Record<string, unknown>) => Promise<unknown>;

interface Tool {
  name: string;
  handler: ToolHandler;
}

export class MCPProvider {
  private tools: Map<string, Tool> = new Map();

  registerTool(name: string, handler: ToolHandler): void {
    this.tools.set(name, { name, handler });
  }

  async executeTool(name: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.handler(params);
  }

  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name);
  }

  clearTools(): void {
    this.tools.clear();
  }

  getToolsForPrompt(): string {
    const toolList = this.getToolNames();
    if (toolList.length === 0) {
      return 'No tools available.';
    }
    return `Available tools:\n${toolList.map(t => `- ${t}`).join('\n')}`;
  }
}
