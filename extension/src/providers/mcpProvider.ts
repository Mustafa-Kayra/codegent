/**
 * AI Agent - MCP Provider
 * 
 * Model Context Protocol (MCP) desteği sağlar.
 * Harici araçlarla entegrasyon imkanı sunar.
 */

import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';

/**
 * MCP sunucu yapılandırması
 */
interface MCPServerConfig {
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
}

/**
 * MCP aracı tanımı
 */
interface MCPTool {
    name: string;
    description: string;
    inputSchema: object;
}

/**
 * MCP sunucu durumu
 */
interface MCPServerState {
    config: MCPServerConfig;
    process: ChildProcess | null;
    tools: MCPTool[];
    isConnected: boolean;
}

/**
 * MCP Provider sınıfı
 * MCP sunucularını yönetir ve araçlara erişim sağlar
 */
export class MCPProvider {
    private servers: Map<string, MCPServerState> = new Map();
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('AI Agent MCP');
    }

    /**
     * Provider'ı başlatır
     */
    async initialize(): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiAgent');
        const serverConfigs = config.get<MCPServerConfig[]>('mcpServers', []);

        for (const serverConfig of serverConfigs) {
            try {
                await this.connectServer(serverConfig);
            } catch (error) {
                this.log(`MCP sunucu bağlantı hatası (${serverConfig.name}): ${error}`);
            }
        }

        this.log(`MCP Provider başlatıldı. ${this.servers.size} sunucu bağlı.`);
    }

    /**
     * MCP sunucusuna bağlanır
     */
    async connectServer(config: MCPServerConfig): Promise<void> {
        this.log(`MCP sunucusuna bağlanılıyor: ${config.name}`);

        try {
            // Sunucu sürecini başlat
            const process = spawn(config.command, config.args || [], {
                env: { ...process.env, ...config.env },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            const serverState: MCPServerState = {
                config,
                process,
                tools: [],
                isConnected: false
            };

            // Stdout'u dinle (MCP yanıtları için)
            if (process.stdout) {
                process.stdout.on('data', (data: Buffer) => {
                    this.handleServerOutput(config.name, data.toString());
                });
            }

            // Stderr'i dinle (hata logları için)
            if (process.stderr) {
                process.stderr.on('data', (data: Buffer) => {
                    this.log(`[${config.name}] Hata: ${data.toString()}`);
                });
            }

            // Süreç kapanma olayını dinle
            process.on('close', (code: number | null) => {
                this.log(`[${config.name}] Süreç kapandı. Kod: ${code}`);
                serverState.isConnected = false;
            });

            process.on('error', (err: Error) => {
                this.log(`[${config.name}] Süreç hatası: ${err.message}`);
                serverState.isConnected = false;
            });

            this.servers.set(config.name, serverState);

            // Araçları keşfet
            await this.discoverTools(config.name);

            serverState.isConnected = true;
            this.log(`MCP sunucusu bağlandı: ${config.name}`);
        } catch (error) {
            throw new Error(`Sunucu başlatılamadı: ${error}`);
        }
    }

    /**
     * Sunucudan araçları keşfeder
     */
    private async discoverTools(serverName: string): Promise<void> {
        const server = this.servers.get(serverName);
        if (!server || !server.process) {
            return;
        }

        // MCP tools/list isteği gönder
        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/list',
            params: {}
        };

        await this.sendRequest(serverName, request);
    }

    /**
     * Sunucuya istek gönderir
     */
    private async sendRequest(serverName: string, request: object): Promise<void> {
        const server = this.servers.get(serverName);
        if (!server || !server.process || !server.process.stdin) {
            throw new Error(`Sunucu bulunamadı: ${serverName}`);
        }

        const message = JSON.stringify(request) + '\n';
        server.process.stdin.write(message);
    }

    /**
     * Sunucu çıktısını işler
     */
    private handleServerOutput(serverName: string, output: string): void {
        try {
            const lines = output.trim().split('\n');
            
            for (const line of lines) {
                if (!line) continue;
                
                const response = JSON.parse(line);
                
                // Araç listesi yanıtı
                if (response.result && response.result.tools) {
                    const server = this.servers.get(serverName);
                    if (server) {
                        server.tools = response.result.tools;
                        this.log(`[${serverName}] ${server.tools.length} araç keşfedildi`);
                    }
                }
            }
        } catch {
            // JSON parse hatası - normal log olarak işle
            this.log(`[${serverName}] ${output}`);
        }
    }

    /**
     * Kullanılabilir araçları döndürür
     */
    getAvailableTools(): string[] {
        const tools: string[] = [];
        
        for (const [serverName, server] of this.servers) {
            for (const tool of server.tools) {
                tools.push(`${serverName}:${tool.name}`);
            }
        }
        
        return tools;
    }

    /**
     * Belirli bir aracı çağırır
     */
    async callTool(toolPath: string, args: object): Promise<object> {
        const [serverName, toolName] = toolPath.split(':');
        
        const server = this.servers.get(serverName);
        if (!server || !server.isConnected) {
            throw new Error(`Sunucu bağlı değil: ${serverName}`);
        }

        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: args
            }
        };

        // İstek gönder ve yanıt bekle
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Araç çağrısı zaman aşımına uğradı'));
            }, 30000);

            // Yanıt için geçici listener
            const responseHandler = (data: Buffer) => {
                try {
                    const response = JSON.parse(data.toString());
                    if (response.id === request.id) {
                        clearTimeout(timeout);
                        
                        if (response.error) {
                            reject(new Error(response.error.message));
                        } else {
                            resolve(response.result);
                        }
                        
                        // Listener'ı kaldır
                        server.process?.stdout?.removeListener('data', responseHandler);
                    }
                } catch {
                    // JSON parse hatası - devam et
                }
            };

            server.process?.stdout?.on('data', responseHandler);
            this.sendRequest(serverName, request).catch(reject);
        });
    }

    /**
     * Araç bilgilerini döndürür
     */
    getToolInfo(toolPath: string): MCPTool | undefined {
        const [serverName, toolName] = toolPath.split(':');
        
        const server = this.servers.get(serverName);
        if (!server) {
            return undefined;
        }

        return server.tools.find(t => t.name === toolName);
    }

    /**
     * Tüm araçların detaylı listesini döndürür
     */
    getAllToolsInfo(): { server: string; tools: MCPTool[] }[] {
        const result: { server: string; tools: MCPTool[] }[] = [];
        
        for (const [serverName, server] of this.servers) {
            result.push({
                server: serverName,
                tools: server.tools
            });
        }
        
        return result;
    }

    /**
     * Log mesajı yazar
     */
    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    /**
     * Sunucu bağlantısını keser
     */
    disconnectServer(serverName: string): void {
        const server = this.servers.get(serverName);
        if (!server) {
            return;
        }

        if (server.process) {
            server.process.kill();
        }

        this.servers.delete(serverName);
        this.log(`MCP sunucusu bağlantısı kesildi: ${serverName}`);
    }

    /**
     * Tüm kaynakları temizler
     */
    dispose(): void {
        // Tüm sunucuları kapat
        for (const serverName of this.servers.keys()) {
            this.disconnectServer(serverName);
        }

        // Output channel'ı kapat
        this.outputChannel.dispose();
    }
}
