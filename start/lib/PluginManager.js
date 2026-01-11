// pluginManager.js
const fs = require('fs');
const path = require('path');

class PluginManager {
    constructor() {
        this.plugins = new Map(); // command -> plugin object
        this.categories = new Map(); // category -> [plugins]
        this.aliases = new Map(); // alias -> main command
    }
    
    // Load all plugins from directory
    loadPlugins(directory) {
        if (!fs.existsSync(directory)) {
            console.log(`📁 Creating plugins directory: ${directory}`);
            fs.mkdirSync(directory, { recursive: true });
            return;
        }
        
        const files = fs.readdirSync(directory);
        let totalPlugins = 0;
        
        for (const file of files) {
            if (file.endsWith('.js') && !file.startsWith('_')) {
                const filePath = path.join(directory, file);
                try {
                    delete require.cache[require.resolve(filePath)];
                    const pluginArray = require(filePath);
                    
                    // Extract category from filename
                    const category = path.basename(file, '.js');
                    
                    if (!Array.isArray(pluginArray)) {
                        console.error(`❌ Plugin file ${file} must export an array`);
                        continue;
                    }
                    
                    
                    
                    for (const plugin of pluginArray) {
                        if (!plugin.command || !Array.isArray(plugin.command) || plugin.command.length === 0) {
                            console.error(`❌ Invalid plugin structure in ${file}: missing or empty command array`);
                            continue;
                        }
                        
                        if (typeof plugin.operate !== 'function') {
                            console.error(`❌ Invalid plugin structure in ${file}: operate must be a function`);
                            continue;
                        }
                        
                        const mainCommand = plugin.command[0].toLowerCase();
                        
                        // Store by main command
                        this.plugins.set(mainCommand, {
                            ...plugin,
                            category: category,
                            mainCommand: mainCommand
                        });
                        
                        // Store all aliases
                        for (const cmd of plugin.command) {
                            const cmdLower = cmd.toLowerCase();
                            this.aliases.set(cmdLower, mainCommand);
                        }
                        
                        // Store by category for menu
                        if (!this.categories.has(category)) {
                            this.categories.set(category, []);
                        }
                        this.categories.get(category).push(plugin);
                        
                        totalPlugins++;
                    }
                    
                } catch (error) {
                    console.error(`❌ Error loading plugin ${file}:`, error.message);
                }
            }
        }
        
        
        return totalPlugins;
    }
    
    // Execute a command
    async executeCommand(context, rawCommand) {
        const command = rawCommand.toLowerCase();
        
        // Check if it's an alias
        const mainCommand = this.aliases.get(command) || command;
        const plugin = this.plugins.get(mainCommand);
        
        if (!plugin) {
            return {
                found: false,
                message: `❌ Command "${rawCommand}" not found`
            };
        }
        
        try {
            // Add additional context
            const enhancedContext = {
                ...context,
                mainCommand: plugin.mainCommand,
                commandAliases: plugin.command,
                category: plugin.category
            };
            
            await plugin.operate(enhancedContext);
            return {
                found: true,
                success: true,
                plugin: plugin
            };
        } catch (error) {
            console.error(`❌ Error executing command ${command}:`, error);
            return {
                found: true,
                success: false,
                error: error.message,
                plugin: plugin
            };
        }
    }
    
    // Get plugin by command
    getPlugin(command) {
        const cmdLower = command.toLowerCase();
        const mainCommand = this.aliases.get(cmdLower) || cmdLower;
        return this.plugins.get(mainCommand);
    }
    
    // Get all plugins for menu
    getAllPlugins() {
        const result = {};
        for (const [category, plugins] of this.categories) {
            result[category] = plugins;
        }
        return result;
    }
    
    // Get commands by category
    getCommandsByCategory() {
        const result = {};
        for (const [category, plugins] of this.categories) {
            result[category] = plugins.map(p => p.command[0]);
        }
        return result;
    }
    
    // Reload all plugins
    reloadPlugins(directory) {
        this.plugins.clear();
        this.categories.clear();
        this.aliases.clear();
        return this.loadPlugins(directory);
    }
    
    // Search for plugins
    searchPlugins(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [mainCommand, plugin] of this.plugins) {
            if (mainCommand.includes(queryLower)) {
                results.push(plugin);
                continue;
            }
            
            // Check aliases
            for (const alias of plugin.command) {
                if (alias.toLowerCase().includes(queryLower)) {
                    results.push(plugin);
                    break;
                }
            }
            
            // Check category
            if (plugin.category.toLowerCase().includes(queryLower)) {
                results.push(plugin);
            }
        }
        
        return results;
    }
}

module.exports = PluginManager;