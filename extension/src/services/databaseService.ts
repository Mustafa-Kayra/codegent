import * as vscode from 'vscode';

export class DatabaseService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.context.globalState.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.context.globalState.update(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.context.globalState.update(key, undefined);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  async keys(): Promise<string[]> {
    return this.context.globalState.keys();
  }

  // Workspace-specific storage
  async getWorkspace<T>(key: string): Promise<T | undefined> {
    return this.context.workspaceState.get<T>(key);
  }

  async setWorkspace<T>(key: string, value: T): Promise<void> {
    await this.context.workspaceState.update(key, value);
  }

  async deleteWorkspace(key: string): Promise<void> {
    await this.context.workspaceState.update(key, undefined);
  }

  // Chat history specific methods
  async getChatHistory(): Promise<Array<{ role: string; content: string; model?: string; timestamp: number }>> {
    return (await this.get('chatHistory')) || [];
  }

  async saveChatHistory(history: Array<{ role: string; content: string; model?: string; timestamp: number }>): Promise<void> {
    await this.set('chatHistory', history);
  }

  async clearChatHistory(): Promise<void> {
    await this.delete('chatHistory');
  }

  // Custom models storage
  async getCustomModels(): Promise<Array<{ id: string; name: string }>> {
    return (await this.get('customModels')) || [];
  }

  async addCustomModel(model: { id: string; name: string }): Promise<void> {
    const models = await this.getCustomModels();
    if (!models.find(m => m.id === model.id)) {
      models.push(model);
      await this.set('customModels', models);
    }
  }

  async removeCustomModel(modelId: string): Promise<void> {
    const models = await this.getCustomModels();
    const filtered = models.filter(m => m.id !== modelId);
    await this.set('customModels', filtered);
  }

  // Image gallery storage
  async getImageGallery(): Promise<Array<{ id: string; url: string; prompt: string; model: string; timestamp: number }>> {
    return (await this.get('imageGallery')) || [];
  }

  async addImage(image: { id: string; url: string; prompt: string; model: string; timestamp: number }): Promise<void> {
    const gallery = await this.getImageGallery();
    gallery.unshift(image);
    if (gallery.length > 50) {
      gallery.pop();
    }
    await this.set('imageGallery', gallery);
  }

  async removeImage(imageId: string): Promise<void> {
    const gallery = await this.getImageGallery();
    const filtered = gallery.filter(img => img.id !== imageId);
    await this.set('imageGallery', filtered);
  }

  // Settings storage
  async getSettings(): Promise<Record<string, unknown>> {
    return (await this.get('settings')) || {};
  }

  async updateSettings(settings: Record<string, unknown>): Promise<void> {
    const current = await this.getSettings();
    await this.set('settings', { ...current, ...settings });
  }
}
