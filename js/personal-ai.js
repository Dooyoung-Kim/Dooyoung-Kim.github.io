/**
 * Personal AI Chat Assistant
 * Answers questions about Dooyoung Kim using Claude API
 */

class PersonalAI {
    constructor() {
        this.apiKey = null;
        this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.init();
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

Please answer questions about Dr. Kim in a friendly, informative manner. If you don't know something specific, say so honestly. Respond in Korean when asked in Korean, and in English when asked in English.`;
    }

    async sendMessage() {
        const input = document.getElementById('personal-ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.apiKey) {
            this.showApiKeyPrompt();
            return;
        }
        
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
                <i class="fas fa-spinner fa-spin"></i> 생각 중...
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
            errorMsg.innerHTML = `
                <div class="personal-ai-avatar">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="personal-ai-message-content">
                    오류가 발생했습니다: ${this.escapeHtml(error.message)}<br>
                    <small>API 키가 필요합니다. 우측 하단의 코드 아이콘을 클릭하여 API 키를 설정해주세요.</small>
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
        
        const response = await fetch(this.apiEndpoint, {
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

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API 요청 실패');
        }

        const data = await response.json();
        return data.content[0].text;
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
                AI 채팅을 사용하려면 Claude API 키가 필요합니다.<br>
                우측 하단의 <i class="fas fa-code"></i> 코드 아이콘을 클릭하여 API 키를 설정해주세요.<br>
                <small><a href="https://console.anthropic.com/" target="_blank">Anthropic Console에서 API 키 발급받기</a></small>
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

