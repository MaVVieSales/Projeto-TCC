window.APP_CONFIG = {
    API_URL: 'http://10.111.9.47:3009', 
};

async function loadConfig() {
    try {
        const response = await fetch('/api-config');
        if (response.ok) {
            const data = await response.json();
            window.APP_CONFIG.API_URL = data.apiUrl;
            console.log('✅ Configuração carregada:', window.APP_CONFIG.API_URL);
        }
    } catch (error) {
        console.warn('⚠️ Usando configuração estática:', window.APP_CONFIG.API_URL);
    }
}

loadConfig();