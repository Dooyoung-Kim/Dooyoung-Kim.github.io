/**
 * Claude Code API Integration
 * Provides code assistance and generation using Claude API
 */

class ClaudeCodeAPI {
    constructor() {
        this.apiKey = null; // Will be set by user
        // 프록시 엔드포인트 사용 (Vercel 배포 후)
        this.proxyEndpoint = '/api/claude-proxy';
        this.directApiEndpoint = 'https://api.anthropic.com/v1/messages';
        this.useProxy = true; // 프록시 사용 여부
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Check if API key is stored in localStorage
        const storedKey = localStorage.getItem('claude_api_key');
        if (storedKey) {
            this.apiKey = storedKey;
            this.isInitialized = true;
        }
        
        // Create UI if not exists
        this.createUI();
    }

    createUI() {
        // Create floating button
        const button = document.createElement('button');
        button.id = 'claude-code-btn';
        button.className = 'claude-code-button';
        button.innerHTML = '<i class="fas fa-code"></i>';
        button.title = 'Claude Code Assistant';
        button.addEventListener('click', () => this.togglePanel());
        document.body.appendChild(button);

        // Create panel
        const panel = document.createElement('div');
        panel.id = 'claude-code-panel';
        panel.className = 'claude-code-panel';
        panel.innerHTML = `
            <div class="claude-code-header">
                <h3><i class="fas fa-robot"></i> Claude Code Assistant</h3>
                <button class="claude-code-close" onclick="claudeAPI.closePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="claude-code-content">
                ${!this.isInitialized ? this.renderSetup() : this.renderChat()}
            </div>
        `;
        document.body.appendChild(panel);
    }

    renderSetup() {
        return `
            <div class="claude-code-setup">
                <p>Enter your Claude API key to use the code assistant:</p>
                <input type="password" id="claude-api-key-input" placeholder="sk-ant-..." class="claude-input">
                <button onclick="claudeAPI.saveApiKey()" class="claude-btn-primary">Save & Connect</button>
                <p class="claude-note">Your API key is stored locally in your browser and never sent to our servers.</p>
                <p class="claude-note">
                    <a href="https://console.anthropic.com/" target="_blank">Get your API key from Anthropic Console</a>
                </p>
            </div>
        `;
    }

    renderChat() {
        return `
            <div class="claude-code-chat">
                <div id="claude-messages" class="claude-messages"></div>
                <div class="claude-input-area">
                    <textarea id="claude-user-input" placeholder="Ask me anything about code, or request code generation..." rows="3" class="claude-textarea"></textarea>
                    <button onclick="claudeAPI.sendMessage()" class="claude-btn-send">
                        <i class="fas fa-paper-plane"></i> Send
                    </button>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="claudeAPI.clearChat()" class="claude-btn-clear">Clear Chat</button>
                    <button onclick="claudeAPI.changeApiKey()" class="claude-btn-clear" style="background: #fff3cd; color: #856404; border-color: #ffc107;">
                        <i class="fas fa-key"></i> Change API Key
                    </button>
                </div>
            </div>
        `;
    }

    saveApiKey() {
        const input = document.getElementById('claude-api-key-input');
        const key = input.value.trim();
        
        if (!key || !key.startsWith('sk-ant-')) {
            alert('Please enter a valid Claude API key (starts with sk-ant-)');
            return;
        }
        
        this.apiKey = key;
        localStorage.setItem('claude_api_key', key);
        this.isInitialized = true;
        
        // Re-render panel
        const content = document.querySelector('.claude-code-content');
        content.innerHTML = this.renderChat();
    }

    togglePanel() {
        const panel = document.getElementById('claude-code-panel');
        panel.classList.toggle('active');
    }

    closePanel() {
        const panel = document.getElementById('claude-code-panel');
        panel.classList.remove('active');
    }

    async sendMessage() {
        const input = document.getElementById('claude-user-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const messagesDiv = document.getElementById('claude-messages');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'claude-message claude-message-user';
        userMsg.innerHTML = `<div class="claude-message-content">${this.escapeHtml(message)}</div>`;
        messagesDiv.appendChild(userMsg);
        
        // Clear input
        input.value = '';
        
        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'claude-message claude-message-assistant';
        loadingMsg.id = 'claude-loading';
        loadingMsg.innerHTML = '<div class="claude-message-content"><i class="fas fa-spinner fa-spin"></i> Thinking...</div>';
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        try {
            const response = await this.callClaudeAPI(message);
            
            // Remove loading message
            document.getElementById('claude-loading').remove();
            
            // Add assistant response
            const assistantMsg = document.createElement('div');
            assistantMsg.className = 'claude-message claude-message-assistant';
            assistantMsg.innerHTML = `<div class="claude-message-content">${this.formatResponse(response)}</div>`;
            messagesDiv.appendChild(assistantMsg);
            
        } catch (error) {
            document.getElementById('claude-loading').remove();
            const errorMsg = document.createElement('div');
            errorMsg.className = 'claude-message claude-message-error';
            
            let errorContent = '';
            if (error.message === 'CORS_ERROR') {
                errorContent = `
                    <strong>⚠️ CORS Error</strong><br><br>
                    Claude API cannot be called directly from the browser due to CORS policy.<br><br>
                    <strong>Solutions:</strong><br>
                    1. Deploy to Vercel to use the proxy server (recommended)<br>
                    2. Test in a local development environment<br>
                    3. Use a backend server to proxy API calls<br><br>
                    <small>See DEPLOYMENT.md for detailed instructions.</small>
                `;
            } else if (error.message === 'PROXY_NOT_FOUND' || error.message === 'PROXY_ERROR') {
                errorContent = `
                    <strong>⚠️ Proxy Server Not Found</strong><br><br>
                    The proxy server is not deployed or not accessible.<br><br>
                    <strong>Solutions:</strong><br>
                    1. Deploy the project to Vercel<br>
                    2. Or use the FAQ system for basic questions<br><br>
                    <small>See DEPLOYMENT.md for deployment instructions.</small>
                `;
            } else {
                errorContent = `Error: ${this.escapeHtml(error.message)}`;
            }
            
            errorMsg.innerHTML = `<div class="claude-message-content">${errorContent}</div>`;
            messagesDiv.appendChild(errorMsg);
        }
        
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async callClaudeAPI(userMessage) {
        try {
            let response;
            
            if (this.useProxy) {
                // Call API through proxy server (solves CORS issue)
                // API key is now handled by the server, no need to send it from client
                response = await fetch(this.proxyEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        // API key is no longer needed - server uses environment variable
                        model: 'claude-3-5-sonnet-20241022',
                        maxTokens: 4096,
                        messages: [
                            {
                                role: 'user',
                                content: `You are a helpful coding assistant. Help with the following request:\n\n${userMessage}`
                            }
                        ]
                    })
                });
            } else {
                // 직접 API 호출 (CORS 에러 발생 가능)
                response = await fetch(this.directApiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 4096,
                        messages: [
                            {
                                role: 'user',
                                content: `You are a helpful coding assistant. Help with the following request:\n\n${userMessage}`
                            }
                        ]
                    })
                });
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                
                // 프록시 서버가 없는 경우 안내
                if (response.status === 404 && this.useProxy) {
                    throw new Error('PROXY_NOT_FOUND');
                }
                
                throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // 프록시 응답 형식 처리
            if (data.success && data.content) {
                return data.content;
            }
            
            // 직접 API 응답 형식 처리
            if (data.content && data.content[0]) {
                return data.content[0].text;
            }
            
            throw new Error('Unexpected response format');
            
        } catch (error) {
            // CORS 에러 감지
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                if (this.useProxy) {
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
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearChat() {
        const messagesDiv = document.getElementById('claude-messages');
        messagesDiv.innerHTML = '';
    }
}

// Initialize Claude API
const claudeAPI = new ClaudeCodeAPI();

// Add Enter key support for textarea
document.addEventListener('keydown', (e) => {
    const textarea = document.getElementById('claude-user-input');
    if (textarea && document.activeElement === textarea && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        claudeAPI.sendMessage();
    }
});

