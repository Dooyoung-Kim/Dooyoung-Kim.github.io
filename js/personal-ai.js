/**
 * Personal AI Chat Assistant
 * Answers questions about Dooyoung Kim using Claude API
 */

class PersonalAI {
    constructor() {
        this.apiKey = null;
        // Proxy endpoint (after Vercel deployment)
        // Local dev: 'http://localhost:3000/api/claude-proxy'
        // Production: 'https://your-site.vercel.app/api/claude-proxy'
        // Or use current domain: '/api/claude-proxy'
        this.proxyEndpoint = '/api/claude-proxy';
        this.directApiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.useProxy = true; // Use proxy
        this.init();
        this.initFAQ(); // Initialize FAQ system
    }
    
    initFAQ() {
        // FAQ Database
        this.faqData = {
            'xrmemory': {
                keywords: ['xrmemory', 'xr memory', 'spatial memory'],
                answer: `XRMemory is a new research field pioneered by Dr. Dooyoung Kim. It aims to develop next-generation immersive platforms that connect people beyond space and time. XRMemory encompasses technologies for capturing, reconstructing, and replaying spatial memories in Augmented Reality (AR) and Virtual Reality (VR) environments. Dr. Kim organizes XRMemory workshops at IEEE VR and ISMAR, and serves as the Lead Guest Editor for the Springer Virtual Reality Journal special issue on "XRMemory".`
            },
            'project': {
                keywords: ['project', 'research project', 'research'],
                answer: `Major research projects include:<br><br>
                <strong>1. Meta-Object ($3M, Co-PI)</strong><br>
                - Project to define and develop next-generation virtual objects<br>
                - Leading 8 teams with over 40 researchers<br><br>
                <strong>2. OpenXR: TranSpace 3.0 ($6M, System Integration Manager)</strong><br>
                - Untact realistic OpenXR remote collaboration platform supporting over 100 concurrent users and heterogeneous devices<br><br>
                <strong>3. Meta-Museum (Project Leader)</strong><br>
                - International collaboration project with NYU Future Reality Lab<br>
                - Building a next-generation metaverse museum across space and time`
            },
            'award': {
                keywords: ['award', 'best paper', 'awards', 'prize'],
                answer: `Major awards and honors:<br><br>
                🏆 <strong>Best Paper Award (Top 1%)</strong> - IEEE ISMAR 2025 (x2)<br>
                🏆 <strong>Best Conference Paper Award (1st Prize)</strong> - IEEE ISMAR 2024<br>
                🏅 <strong>Best Presentation Award (1st Prize)</strong> - APMAR 2022<br>
                🏅 <strong>Honorable Mention Award (Top 5%)</strong> - ACM CHI 2021<br><br>
                A total of 3 Best Paper Awards, representing top 1% achievement at IEEE ISMAR.`
            },
            'technology': {
                keywords: ['tech', 'technology', 'skill', 'language', 'technologies'],
                answer: `Research areas and technologies:<br><br>
                <strong>Research Areas:</strong><br>
                - XRMemory (Pioneer)<br>
                - Spatial AI & Augmented Reality<br>
                - Virtual Reality & Mixed Reality<br>
                - Human-Computer Interaction<br>
                - 3D User Interface<br><br>
                <strong>Tech Stack:</strong><br>
                - Unity, C#<br>
                - Python, PyTorch<br>
                - OpenXR<br>
                - AR/VR Development Tools`
            },
            'publication': {
                keywords: ['publication', 'paper', 'journal', 'papers'],
                answer: `Over 25 publications have been published:<br><br>
                <strong>Major Journals:</strong><br>
                - IEEE Transactions on Visualization and Computer Graphics (TVCG)<br>
                - IEEE Computer Graphics and Applications<br>
                - Springer Virtual Reality<br><br>
                <strong>Major Conferences:</strong><br>
                - IEEE ISMAR (3 Best Paper Awards)<br>
                - IEEE VR<br>
                - ACM CHI (Honorable Mention)<br>
                - ACM UIST<br><br>
                Full publication list is available on Google Scholar.`
            },
            'patent': {
                keywords: ['patent', 'patents'],
                answer: `7 patents filed/issued:<br><br>
                - Method and System for Generating Remote Collaboration Mutual Space (KR/PCT, Issued)<br>
                - Virtual Reality Space Adjusting Method with Relative Translation Gain in Redirected Walking (KR/US, Issued)<br>
                - Method of Operating Mixed Reality Telepresence System (KR, Issued)<br>
                - Edge-Centric Space Rescaling Method for Dissimilar Space Registration (KR/US, Filed)<br>
                - Real-time Affordance Visualization System with Meta-Objects (KR, Filed)<br>
                - Object Cluster Registration Using Geometric Spatial Affordance Graph (KR, Filed)<br>
                - Spatial Extension Using Human Stereoscopic Perception with Large Wall Display (KR, Filed)`
            },
            'education': {
                keywords: ['education', 'degree', 'school', 'university'],
                answer: `Education:<br><br>
                <strong>PhD in Culture Technology (AR/VR)</strong><br>
                - KAIST (2021-2024)<br>
                - Thesis: Space-Adaptive Mutual Space Generation for Mixed Reality Remote Collaboration<br>
                - Advisor: Woontack Woo<br><br>
                <strong>Master in Culture Technology (AR/VR)</strong><br>
                - KAIST (2019-2021)<br>
                - Advisor: Woontack Woo<br><br>
                <strong>Bachelor in Mechanical Engineering</strong><br>
                - KAIST (2014-2019)<br>
                - 2026 Fall: Exchange Student @ Tsinghua University, Beijing, China`
            }
        };
    }
    
    findFAQAnswer(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Try exact match first
        for (const [key, data] of Object.entries(this.faqData)) {
            for (const keyword of data.keywords) {
                if (lowerQuestion.includes(keyword.toLowerCase())) {
                    return data.answer;
                }
            }
        }
        
        // Try partial matches for common questions
        if (lowerQuestion.includes('what') && (lowerQuestion.includes('xrmemory') || lowerQuestion.includes('xr memory'))) {
            return this.faqData.xrmemory.answer;
        }
        if (lowerQuestion.includes('project') || lowerQuestion.includes('research')) {
            return this.faqData.project.answer;
        }
        if (lowerQuestion.includes('award') || lowerQuestion.includes('prize') || lowerQuestion.includes('best paper')) {
            return this.faqData.award.answer;
        }
        if (lowerQuestion.includes('tech') || lowerQuestion.includes('skill') || lowerQuestion.includes('language')) {
            return this.faqData.technology.answer;
        }
        if (lowerQuestion.includes('publication') || lowerQuestion.includes('paper') || lowerQuestion.includes('journal')) {
            return this.faqData.publication.answer;
        }
        if (lowerQuestion.includes('patent')) {
            return this.faqData.patent.answer;
        }
        if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('phd') || lowerQuestion.includes('master')) {
            return this.faqData.education.answer;
        }
        
        return null;
    }

    init() {
        // Check if API key is stored
        const storedKey = localStorage.getItem('claude_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
        } else {
            // Try to get from Claude Code API if available
            if (typeof claudeAPI !== 'undefined' && claudeAPI.apiKey) {
                this.apiKey = claudeAPI.apiKey;
            }
        }
    }

    getPersonalContext() {
        return `You are an AI assistant helping visitors learn about Dr. Dooyoung Kim, a Senior Researcher (PhD) at KAIST.

Here is comprehensive information about Dr. Dooyoung Kim:

**Current Position:**
- Senior Researcher (PhD) at KAIST
- Visiting Researcher at NYU Future Reality Lab (collaborating with Ken Perlin)
- Global Shaper @ World Economic Forum (Founding Curator of Daejeon Hub)

**Research Focus:**
- XRMemory: Pioneering this new field, organizing workshops at IEEE VR and ISMAR
- Spatial AI & Augmented Reality
- Virtual Reality & Mixed Reality
- Human-Computer Interaction
- 3D User Interface

**Key Achievements:**
- 3 Best Paper Awards (Top 1%) at IEEE ISMAR (2025 x2, 2024 x1)
- Over 25 publications in top-tier conferences and journals (AR/VR/HCI/Graphics)
- 7 filed patents
- Lead Guest Editor for Springer Virtual Reality Journal special issue on "XRMemory"
- ISO/IEC JTC 1/SC 24 international standardization work

**Major Projects:**
- Co-PI on $3M NRF grant (Meta-Object project) - Leading 40 researchers across 8 teams
- System Integration Manager for $6M NRF grant (OpenXR: TranSpace 3.0)
- Project Leader for KAIST-NYU Meta-Museum collaboration
- Creator at ZER01NE (Hyundai Motor Group) - Holobot, Automatic SONATA

**Education:**
- PhD in Culture Technology (AR/VR) from KAIST (2021-2024)
- Master in Culture Technology (AR/VR) from KAIST (2019-2021)
- Bachelor in Mechanical Engineering from KAIST (2014-2019)

**Service & Leadership:**
- Organizing workshops at IEEE VR and ISMAR
- IPC/Reviewer for IEEE ISMAR, IEEE VR, ACM CHI, ACM VRST
- Assistant to General Chairs and Social Event Chair of IEEE ISMAR 2025

**Contact:**
- Email: dooyoung.kim@kaist.ac.kr
- LinkedIn: linkedin.com/in/dooyoung-kim-xr
- Google Scholar: scholar.google.com/citations?user=2DwDeKIAAAAJ

Please answer questions about Dr. Kim in a friendly, informative manner. If you don't know something specific, say so honestly. Always respond in English.`;
    }

    async sendMessage() {
        const input = document.getElementById('personal-ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // First, try to find answer in FAQ
        const faqAnswer = this.findFAQAnswer(message);
        if (faqAnswer) {
            const messagesDiv = document.getElementById('personal-ai-messages');
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'personal-ai-message personal-ai-message-user';
            userMsg.innerHTML = `
                <div class="personal-ai-avatar personal-ai-avatar-user">
                    <i class="fas fa-user"></i>
                </div>
                <div class="personal-ai-message-content">${this.escapeHtml(message)}</div>
            `;
            messagesDiv.appendChild(userMsg);
            
            // Add FAQ answer
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'personal-ai-message personal-ai-message-assistant';
            assistantMsg.innerHTML = `
                <div class="personal-ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="personal-ai-message-content">${faqAnswer}</div>
            `;
            messagesDiv.appendChild(assistantMsg);
            
            input.value = '';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            return;
        }
        
        // API key is no longer required from user - server handles it
        // Just proceed with API call
        
        const messagesDiv = document.getElementById('personal-ai-messages');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'personal-ai-message personal-ai-message-user';
        userMsg.innerHTML = `
            <div class="personal-ai-avatar personal-ai-avatar-user">
                <i class="fas fa-user"></i>
            </div>
            <div class="personal-ai-message-content">${this.escapeHtml(message)}</div>
        `;
        messagesDiv.appendChild(userMsg);
        
        // Clear input
        input.value = '';
        input.disabled = true;
        const sendBtn = document.getElementById('personal-ai-send-btn');
        sendBtn.disabled = true;
        
        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'personal-ai-message personal-ai-message-assistant';
        loadingMsg.id = 'personal-ai-loading';
        loadingMsg.innerHTML = `
            <div class="personal-ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="personal-ai-message-content">
                <i class="fas fa-spinner fa-spin"></i> Thinking...
            </div>
        `;
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        try {
            const response = await this.callClaudeAPI(message);
            
            // Remove loading message
            document.getElementById('personal-ai-loading').remove();
            
            // Add assistant response
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'personal-ai-message personal-ai-message-assistant';
            assistantMsg.innerHTML = `
                <div class="personal-ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="personal-ai-message-content">${this.formatResponse(response)}</div>
            `;
            messagesDiv.appendChild(assistantMsg);
            
        } catch (error) {
            document.getElementById('personal-ai-loading').remove();
            const errorMsg = document.createElement('div');
            errorMsg.className = 'personal-ai-message personal-ai-message-error';
            
            let errorContent = '';
            if (error.message === 'CORS_ERROR') {
                errorContent = `
                    <strong>⚠️ CORS Error Occurred</strong><br><br>
                    Claude API cannot be called directly from the browser (CORS policy).<br><br>
                    <strong>Solutions:</strong><br>
                    1. Deploy to Vercel to use proxy server (recommended)<br>
                    2. Test in local development environment<br>
                    3. Call API through backend server<br><br>
                    <small>See DEPLOYMENT.md for detailed instructions.</small>
                `;
            } else if (error.message === 'PROXY_NOT_FOUND' || error.message === 'PROXY_ERROR') {
                errorContent = `
                    <strong>ℹ️ Proxy Server Not Available</strong><br><br>
                    The proxy server is not deployed yet. You can still use the FAQ system for common questions!<br><br>
                    <strong>Try asking about:</strong><br>
                    • What is XRMemory?<br>
                    • Research projects<br>
                    • Awards and honors<br>
                    • Technologies used<br>
                    • Publications<br>
                    • Patents<br>
                    • Education<br><br>
                    <small>To enable full AI responses, deploy to Vercel (see DEPLOYMENT.md) or set up a proxy server.</small>
                `;
            } else if (error.message === 'PROXY_METHOD_ERROR' || error.message.includes('405')) {
                errorContent = `
                    <strong>⚠️ Proxy Server Configuration Error</strong><br><br>
                    The proxy server received an invalid request method. This might be a deployment issue.<br><br>
                    <strong>Solutions:</strong><br>
                    1. Check Vercel deployment logs for errors<br>
                    2. Verify the function is deployed correctly<br>
                    3. Try redeploying the project<br>
                    4. Use FAQ system for now<br><br>
                    <small>Error: ${this.escapeHtml(error.message)}</small>
                `;
            } else {
                errorContent = `
                    An error occurred: ${this.escapeHtml(error.message)}<br><br>
                    <small>Please verify your API key is correct, or click the code icon in the bottom right to set your API key again.</small>
                `;
            }
            
            errorMsg.innerHTML = `
                <div class="personal-ai-avatar">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="personal-ai-message-content">
                    ${errorContent}
                </div>
            `;
            messagesDiv.appendChild(errorMsg);
        }
        
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async callClaudeAPI(userMessage) {
        const systemPrompt = this.getPersonalContext();
        
        try {
            let response;
            
            if (this.useProxy) {
                // Call API through proxy server (solves CORS issue)
                // API key is now handled by the server, no need to send it from client
                const proxyUrl = this.proxyEndpoint;
                
                response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        // API key is no longer needed - server uses environment variable
                        model: 'claude-3-5-sonnet-20241022',
                        maxTokens: 2048,
                        system: systemPrompt,
                        messages: [
                            {
                                role: 'user',
                                content: userMessage
                            }
                        ]
                    })
                });
            } else {
                // Direct API call (may cause CORS error)
                response = await fetch(this.directApiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 2048,
                        system: systemPrompt,
                        messages: [
                            {
                                role: 'user',
                                content: userMessage
                            }
                        ]
                    })
                });
            }

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { 
                        error: response.statusText,
                        message: `HTTP ${response.status}: ${response.statusText}`
                    };
                }
                
                // Guide if proxy server is not found
                if (response.status === 404 && this.useProxy) {
                    throw new Error('PROXY_NOT_FOUND');
                }
                
                // Handle 405 Method Not Allowed
                if (response.status === 405 && this.useProxy) {
                    throw new Error('PROXY_METHOD_ERROR');
                }
                
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Handle proxy response format
            if (data.success && data.content) {
                return data.content;
            }
            
            // Handle direct API response format
            if (data.content && data.content[0]) {
                return data.content[0].text;
            }
            
            throw new Error('Unexpected response format');
            
        } catch (error) {
            // Detect CORS/proxy error
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                if (this.useProxy) {
                    // If proxy fails, it's likely not deployed - show friendly message
                    throw new Error('PROXY_ERROR');
                } else {
                    throw new Error('CORS_ERROR');
                }
            }
            throw error;
        }
    }

    formatResponse(text) {
        // Format code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Format inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format line breaks
        text = text.replace(/\n/g, '<br>');
        
        // Format bold
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    askSuggestion(question) {
        const input = document.getElementById('personal-ai-input');
        input.value = question;
        this.sendMessage();
    }

    showApiKeyPrompt() {
        const messagesDiv = document.getElementById('personal-ai-messages');
        const promptMsg = document.createElement('div');
        promptMsg.className = 'personal-ai-message personal-ai-message-info';
        promptMsg.innerHTML = `
            <div class="personal-ai-avatar">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="personal-ai-message-content">
                A Claude API key is required to use the AI chat.<br>
                Click the <i class="fas fa-code"></i> code icon in the bottom right to set your API key.<br>
                <small><a href="https://console.anthropic.com/" target="_blank">Get your API key from Anthropic Console</a></small>
            </div>
        `;
        messagesDiv.appendChild(promptMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Initialize Personal AI
const personalAI = new PersonalAI();

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('personal-ai-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                personalAI.sendMessage();
            }
        });
    }
    
    // Update API key when Claude Code API is initialized
    if (typeof claudeAPI !== 'undefined') {
        const originalSaveApiKey = claudeAPI.saveApiKey;
        claudeAPI.saveApiKey = function() {
            originalSaveApiKey.call(this);
            personalAI.apiKey = this.apiKey;
        };
    }
});

