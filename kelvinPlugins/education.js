const axios = require("axios");

module.exports = [
    {
        command: ['math', 'simplify'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Math Simplify*\n\nPlease provide a math expression to simplify.\n\nExample:\n${prefix}math 2^8\n${prefix}simplify (5+3)*2`);

            const expression = text.trim();
            
            await reply('Simplifying expression... Please wait...');
            await kelvin.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            try {
                const apiUrl = `https://apiskeith.top/math/simplify?expr=${encodeURIComponent(expression)}`;
                const response = await axios.get(apiUrl, { timeout: 10000 });
                
                if (!response.data?.status) throw new Error('Invalid API response');

                const result = response.data.result;
                
                const replyMsg = `🧮 *Math Simplification*\n\n` +
                                `📝 *Expression:* ${response.data.expression}\n` +
                                `✅ *Result:* ${result}\n\n` +
                                `> ${global.wm}`;

                await kelvin.sendMessage(m.chat, { text: replyMsg }, { quoted: m });
                await kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (error) {
                console.error('Math API Error:', error.message);
                await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                reply('Failed to simplify expression. Please check your expression and try again.');
            }
        }
    },   
    {
        command: ['dictionary', 'dict', 'define'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Dictionary*\n\nPlease provide a word to define.\n\nExample:\n${prefix}dictionary cat\n${prefix}define hello`);

            const word = text.trim().toLowerCase();
            
            await reply(`🔍 Searching definition for: *${word}*...`);
            await kelvin.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

            try {
                const apiUrl = `https://apiskeith.top/education/dictionary?q=${encodeURIComponent(word)}`;
                const response = await axios.get(apiUrl, { timeout: 15000 });
                
                if (!response.data?.status || !response.data?.result) throw new Error('Invalid API response');

                const data = response.data.result;
                
                let definitionText = `📖 *Dictionary: ${data.word}*\n\n`;
                
                if (data.phonetics && data.phonetics.length > 0) {
                    const pronunciation = data.phonetics.find(p => p.text) || data.phonetics[0];
                    if (pronunciation.text) definitionText += `🔊 *Pronunciation:* ${pronunciation.text}\n\n`;
                }
                
                if (data.meanings && data.meanings.length > 0) {
                    data.meanings.forEach((meaning, index) => {
                        definitionText += `*${meaning.partOfSpeech.toUpperCase()}*\n`;
                        
                        if (meaning.definitions && meaning.definitions.length > 0) {
                            meaning.definitions.slice(0, 3).forEach((def, i) => {
                                definitionText += `${i+1}. ${def.definition}\n`;
                                if (def.example) definitionText += `   _\"${def.example}\"_\n`;
                            });
                            
                            if (meaning.definitions.length > 3) {
                                definitionText += `   *+${meaning.definitions.length - 3} more definitions*\n`;
                            }
                        }
                        
                        if (meaning.synonyms && meaning.synonyms.length > 0) {
                            definitionText += `   *Synonyms:* ${meaning.synonyms.slice(0, 5).join(', ')}`;
                            if (meaning.synonyms.length > 5) definitionText += ` +${meaning.synonyms.length - 5} more`;
                            definitionText += `\n`;
                        }
                        
                        definitionText += `\n`;
                    });
                }
                
                if (data.sourceUrls && data.sourceUrls.length > 0) {
                    definitionText += `📚 *Source:* ${data.sourceUrls[0]}\n`;
                }

                await kelvin.sendMessage(m.chat, { text: definitionText }, { quoted: m });
                await kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (error) {
                console.error('Dictionary API Error:', error.message);
                await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                
                let errorMsg = `❌ Could not find definition for "*${word}*".`;
                if (error.response?.status === 404) {
                    errorMsg = `❌ No definition found for "*${word}*". Please check the spelling.`;
                }
                reply(errorMsg);
            }
        }
    },
    {
        command: ['poem', 'randompoem'],
        operate: async ({ kelvin, m, reply }) => {
            await reply('Finding a random poem for you... Please wait...');
            await kelvin.sendMessage(m.chat, { react: { text: '📖', key: m.key } });

            try {
                const apiUrl = 'https://apiskeith.top/education/randompoem';
                const response = await axios.get(apiUrl, { timeout: 15000 });
                
                if (!response.data?.status || !response.data?.result) throw new Error('Invalid API response');

                const poem = response.data.result;
                
                let poemText = `📜 *${poem.title}*\n`;
                poemText += `✍️ *by ${poem.author}*\n\n`;
                
                if (poem.lines && poem.lines.length > 0) {
                    poemText += poem.lines.join('\n');
                } else if (poem.fullText) {
                    poemText += poem.fullText;
                }
                
                if (poem.lineCount) {
                    poemText += `\n\n_━━━━━━━━━━━━━━_\n📊 *${poem.lineCount} lines*`;
                }

                await kelvin.sendMessage(m.chat, { text: poemText }, { quoted: m });
                await kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (error) {
                console.error('Random Poem API Error:', error.message);
                await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                reply('❌ Failed to fetch a random poem. Please try again later.');
            }
        }
    },
    {
        command: ['fruit', 'fruitinfo'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Fruit Information*\n\nPlease provide a fruit name.\n\nExample:\n${prefix}fruit apple\n${prefix}fruitinfo banana`);

            const fruitName = text.trim().toLowerCase();
            
            await reply(`🔍 Searching for information about: *${fruitName}*...`);
            await kelvin.sendMessage(m.chat, { react: { text: '🍊', key: m.key } });

            try {
                const apiUrl = `https://apiskeith.top/education/fruit?q=${encodeURIComponent(fruitName)}`;
                const response = await axios.get(apiUrl, { timeout: 10000 });
                
                if (!response.data?.status || !response.data?.result) throw new Error('Invalid API response');

                const fruit = response.data.result;
                
                let fruitText = `🍎 *Fruit: ${fruit.name}*\n\n`;
                fruitText += `📚 *Scientific Classification*\n`;
                fruitText += `• Family: ${fruit.family || 'N/A'}\n`;
                fruitText += `• Genus: ${fruit.genus || 'N/A'}\n`;
                fruitText += `• Order: ${fruit.order || 'N/A'}\n\n`;
                
                if (fruit.nutritions) {
                    fruitText += `🥗 *Nutrition Facts (per 100g)*\n`;
                    fruitText += `• Calories: ${fruit.nutritions.calories || 0} kcal\n`;
                    fruitText += `• Fat: ${fruit.nutritions.fat || 0}g\n`;
                    fruitText += `• Sugar: ${fruit.nutritions.sugar || 0}g\n`;
                    fruitText += `• Carbohydrates: ${fruit.nutritions.carbohydrates || 0}g\n`;
                    fruitText += `• Protein: ${fruit.nutritions.protein || 0}g\n`;
                }

                await kelvin.sendMessage(m.chat, { text: fruitText }, { quoted: m });
                await kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (error) {
                console.error('Fruit API Error:', error.message);
                await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                
                let errorMsg = `❌ Could not find information for "${fruitName}".`;
                if (error.response?.status === 404) {
                    errorMsg = `❌ No information found for "${fruitName}". Please check the spelling.`;
                }
                reply(errorMsg);
            }
        }
    },
    {
        command: ['book', 'booksearch'],
        operate: async ({ kelvin, m, reply, text, prefix }) => {
            if (!text) return reply(`*Book Search*\n\nPlease provide a book title to search.\n\nExample:\n${prefix}book a doll's house\n${prefix}booksearch harry potter`);

            const query = text.trim();
            
            await reply(`🔍 Searching for books: *${query}*...`);
            await kelvin.sendMessage(m.chat, { react: { text: '📚', key: m.key } });

            try {
                const apiUrl = `https://apiskeith.top/education/booksearch?q=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl, { timeout: 15000 });
                
                if (!response.data?.status || !response.data?.result || response.data.result.length === 0) {
                    throw new Error('No books found');
                }

                const books = response.data.result;
                
                let bookText = `📚 *Book Search Results for "${query}"*\n\n`;
                bookText += `━━━━━━━━━━━━━━━━━━\n\n`;
                
                const maxBooks = Math.min(books.length, 3);
                
                for (let i = 0; i < maxBooks; i++) {
                    const book = books[i];
                    
                    bookText += `📖 *${i+1}. ${book.title}*\n`;
                    
                    if (book.authors && book.authors.length > 0) {
                        const authorNames = book.authors.map(a => a.name).join(', ');
                        bookText += `✍️ *Author:* ${authorNames}\n`;
                    }
                    
                    if (book.summary) {
                        const shortSummary = book.summary.length > 200 
                            ? book.summary.substring(0, 200) + '...' 
                            : book.summary;
                        bookText += `📝 *Summary:* ${shortSummary}\n`;
                    }
                    
                    bookText += `📊 *Downloads:* ${book.downloadCount?.toLocaleString() || 0}\n`;
                    bookText += `🔤 *Language:* ${book.languages?.join(', ') || 'en'}\n`;
                    
                    if (book.subjects && book.subjects.length > 0) {
                        const subjects = book.subjects.slice(0, 2).join(' • ');
                        bookText += `🏷️ *Topics:* ${subjects}`;
                        if (book.subjects.length > 2) bookText += ` +${book.subjects.length - 2} more`;
                        bookText += `\n`;
                    }
                    
                    bookText += `\n━━━━━━━━━━━━━━━━━━\n\n`;
                }
                
                if (books.length > 3) {
                    bookText += `_...and ${books.length - 3} more results. Search more specifically for detailed results._`;
                }

                await kelvin.sendMessage(m.chat, { text: bookText }, { quoted: m });
                await kelvin.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

            } catch (error) {
                console.error('Book Search API Error:', error.message);
                await kelvin.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                
                let errorMsg = `❌ No books found for "${query}".`;
                if (error.message.includes('timeout')) {
                    errorMsg = '❌ Request timed out. Please try again.';
                } else if (error.message.includes('No books found')) {
                    errorMsg = `❌ No books found matching "${query}". Try a different title.`;
                }
                reply(errorMsg);
            }
        }
    }
];