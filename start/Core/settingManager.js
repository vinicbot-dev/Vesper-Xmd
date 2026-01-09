const path = require('path');
const fs = require('fs');

class SettingsManager {
    constructor() {
        this.settingsPath = path.join(__dirname, '../data/database.json');
        this.settings = this.loadSettings();
    }

    loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return {};
    }

    saveSettings() {
        try {
            const dir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getSetting(botNumber, key, defaultValue = null) {
        if (!this.settings[botNumber]) {
            this.settings[botNumber] = {};
        }
        if (!this.settings[botNumber][key] && defaultValue !== null) {
            this.settings[botNumber][key] = defaultValue;
            this.saveSettings();
        }
        return this.settings[botNumber][key];
    }

    setSetting(botNumber, key, value) {
        if (!this.settings[botNumber]) {
            this.settings[botNumber] = {};
        }
        this.settings[botNumber][key] = value;
        return this.saveSettings();
    }

    getAllSettings(botNumber) {
        return this.settings[botNumber] || {};
    }

    initGroupSettings(botNumber) {
        if (!this.settings[botNumber]) {
            this.settings[botNumber] = {};
        }
        if (!this.settings[botNumber].groups) {
            this.settings[botNumber].groups = {};
        }
    }

    getGroupSetting(botNumber, groupId, key, defaultValue = null) {
        this.initGroupSettings(botNumber);
        if (!this.settings[botNumber].groups[groupId]) {
            this.settings[botNumber].groups[groupId] = {};
        }
        if (!this.settings[botNumber].groups[groupId][key] && defaultValue !== null) {
            this.settings[botNumber].groups[groupId][key] = defaultValue;
            this.saveSettings();
        }
        return this.settings[botNumber].groups[groupId][key];
    }

    setGroupSetting(botNumber, groupId, key, value) {
        this.initGroupSettings(botNumber);
        if (!this.settings[botNumber].groups[groupId]) {
            this.settings[botNumber].groups[groupId] = {};
        }
        this.settings[botNumber].groups[groupId][key] = value;
        return this.saveSettings();
    }

    isWelcomeEnabled(botNumber, groupId) {
        return this.getGroupSetting(botNumber, groupId, 'welcome', false) === true;
    }

    setWelcomeEnabled(botNumber, groupId, enabled) {
        return this.setGroupSetting(botNumber, groupId, 'welcome', enabled);
    }

    getAllGroupSettings(botNumber) {
        this.initGroupSettings(botNumber);
        return this.settings[botNumber].groups || {};
    }

    getGroupSettings(botNumber, groupId) {
        this.initGroupSettings(botNumber);
        return this.settings[botNumber].groups[groupId] || {};
    }

    getSudo(botNumber) {
        if (!this.settings[botNumber]) {
            this.settings[botNumber] = {};
        }
        if (!this.settings[botNumber].sudo) {
            this.settings[botNumber].sudo = [];
        }
        return this.settings[botNumber].sudo;
    }

    addSudo(botNumber, userJid) {
        if (!this.settings[botNumber]) {
            this.settings[botNumber] = {};
        }
        if (!this.settings[botNumber].sudo) {
            this.settings[botNumber].sudo = [];
        }
        if (!this.settings[botNumber].sudo.includes(userJid)) {
            this.settings[botNumber].sudo.push(userJid);
            return this.saveSettings();
        }
        return false;
    }

    removeSudo(botNumber, userJid) {
        if (!this.settings[botNumber] || !this.settings[botNumber].sudo) {
            return false;
        }
        const index = this.settings[botNumber].sudo.indexOf(userJid);
        if (index > -1) {
            this.settings[botNumber].sudo.splice(index, 1);
            return this.saveSettings();
        }
        return false;
    }

    hasSudo(botNumber, userJid) {
        if (!this.settings[botNumber] || !this.settings[botNumber].sudo) {
            return false;
        }
        return this.settings[botNumber].sudo.includes(userJid);
    }

    syncToGlobals(botNumber) {
        if (!this.settings[botNumber]) return;
        const settings = this.settings[botNumber];
        if (settings.autorecording !== undefined) global.autorecording = settings.autorecording;
        if (settings.AI_CHAT !== undefined) global.AI_CHAT = settings.AI_CHAT;
        if (settings.antidelete !== undefined) global.antidelete = settings.antidelete;
        if (settings.antiedit !== undefined) global.antiedit = settings.antiedit;
        if (settings.antilinkdelete !== undefined) global.antilinkdelete = settings.antilinkdelete;
        if (settings.autoreact !== undefined) global.autoreact = settings.autoreact;
        if (settings.autoread !== undefined) global.autoread = settings.autoread;
        if (settings.autoviewstatus !== undefined) global.autoviewstatus = settings.autoviewstatus;
        if (settings.autoreactstatus !== undefined) global.autoreactstatus = settings.autoreactstatus;
        if (settings.welcome !== undefined) global.welcome = settings.welcome;
        if (settings.adminevent !== undefined) global.adminevent = settings.adminevent;
        if (settings.antibug !== undefined) global.antibug = settings.antibug;
        if (settings.anticall !== undefined) global.anticall = settings.anticall;
        if (settings.autobio !== undefined) global.autobio = settings.autobio;
        if (settings.prefix !== undefined) global.prefix = settings.prefix;
        console.log(`✅ Bot-level settings synced to globals for ${botNumber}`);
    }
}

const settingsManager = new SettingsManager();

function getSetting(botNumber, key, defaultValue = null) {
    return settingsManager.getSetting(botNumber, key, defaultValue);
}

function updateSetting(botNumber, key, value) {
    return settingsManager.setSetting(botNumber, key, value);
}

function getAllSettings(botNumber) {
    return settingsManager.getAllSettings(botNumber);
}

function getGroupSetting(botNumber, groupId, key, defaultValue = null) {
    return settingsManager.getGroupSetting(botNumber, groupId, key, defaultValue);
}

function setGroupSetting(botNumber, groupId, key, value) {
    return settingsManager.setGroupSetting(botNumber, groupId, key, value);
}

function isWelcomeEnabled(botNumber, groupId) {
    return settingsManager.isWelcomeEnabled(botNumber, groupId);
}

function setWelcomeEnabled(botNumber, groupId, enabled) {
    return settingsManager.setWelcomeEnabled(botNumber, groupId, enabled);
}

function getAllGroupSettings(botNumber) {
    return settingsManager.getAllGroupSettings(botNumber);
}

function getGroupSettings(botNumber, groupId) {
    return settingsManager.getGroupSettings(botNumber, groupId);
}

function getSudo(botNumber) {
    return settingsManager.getSudo(botNumber);
}

function addSudo(botNumber, userJid) {
    return settingsManager.addSudo(botNumber, userJid);
}

function removeSudo(botNumber, userJid) {
    return settingsManager.removeSudo(botNumber, userJid);
}

function hasSudo(botNumber, userJid) {
    return settingsManager.hasSudo(botNumber, userJid);
}

function syncToGlobals(botNumber) {
    return settingsManager.syncToGlobals(botNumber);
}

module.exports = {
    settingsManager,
    getSetting,
    updateSetting,
    getAllSettings,
    getGroupSetting,
    setGroupSetting,
    isWelcomeEnabled,
    setWelcomeEnabled,
    getAllGroupSettings,
    getGroupSettings,
    getSudo,
    addSudo,
    removeSudo,
    hasSudo,
    syncToGlobals,
    setSetting: updateSetting
};

global.settingsManager = settingsManager;