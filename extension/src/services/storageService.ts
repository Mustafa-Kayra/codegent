/**
 * Storage Service
 * Handles persistent storage for settings and data
 */

import * as vscode from 'vscode';

export class StorageService {
  private globalState: vscode.Memento;
  private workspaceState: vscode.Memento;
  private secrets: vscode.SecretStorage;

  constructor(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
    this.workspaceState = context.workspaceState;
    this.secrets = context.secrets;
  }

  /**
   * Get a value from global storage
   */
  public async get<T>(key: string): Promise<T | undefined> {
    return this.globalState.get<T>(key);
  }

  /**
   * Set a value in global storage
   */
  public async set<T>(key: string, value: T): Promise<void> {
    await this.globalState.update(key, value);
  }

  /**
   * Delete a value from global storage
   */
  public async delete(key: string): Promise<void> {
    await this.globalState.update(key, undefined);
  }

  /**
   * Get a value from workspace storage
   */
  public async getWorkspace<T>(key: string): Promise<T | undefined> {
    return this.workspaceState.get<T>(key);
  }

  /**
   * Set a value in workspace storage
   */
  public async setWorkspace<T>(key: string, value: T): Promise<void> {
    await this.workspaceState.update(key, value);
  }

  /**
   * Delete a value from workspace storage
   */
  public async deleteWorkspace(key: string): Promise<void> {
    await this.workspaceState.update(key, undefined);
  }

  /**
   * Get a secret value
   */
  public async getSecret(key: string): Promise<string | undefined> {
    return this.secrets.get(key);
  }

  /**
   * Set a secret value
   */
  public async setSecret(key: string, value: string): Promise<void> {
    await this.secrets.store(key, value);
  }

  /**
   * Delete a secret value
   */
  public async deleteSecret(key: string): Promise<void> {
    await this.secrets.delete(key);
  }

  /**
   * Get all keys in global storage
   */
  public getKeys(): readonly string[] {
    return this.globalState.keys();
  }

  /**
   * Clear all storage (use with caution)
   */
  public async clearAll(): Promise<void> {
    const keys = this.getKeys();
    for (const key of keys) {
      await this.delete(key);
    }
  }
}
