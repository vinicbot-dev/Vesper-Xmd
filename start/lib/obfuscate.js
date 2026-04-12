const axios = require('axios');

async function obfuscateCode(code, level = 'medium') {
    try {
        const encodedCode = encodeURIComponent(code);
        const apiUrl = `https://apis.davidcyril.name.ng/obfuscate?code=${encodedCode}&level=${level}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        
        if (response.data?.success && response.data?.result?.obfuscated_code?.code) {
            return {
                success: true,
                obfuscated: response.data.result.obfuscated_code.code,
                original: code,
                level: level
            };
        }
        return { success: false, error: 'API returned no obfuscated code' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = { obfuscateCode };