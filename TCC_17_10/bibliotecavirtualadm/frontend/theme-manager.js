const ThemeManager = {
    STORAGE_KEY: 'biblioteca-virtual-theme',
    
    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'light';
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateIcon();
            });
        } else {
            this.updateIcon();
        }
    },
    
    toggle() {
        const isDark = document.body.classList.toggle('dark-mode');
        
        localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
        
        this.updateIcon();
        
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: isDark ? 'dark' : 'light' }
        }));
    },
    
    updateIcon() {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;
        
        const isDark = document.body.classList.contains('dark-mode');
        
        if (isDark) {
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5" fill="white"/>
                <path fill="white" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" fill="white"/>
            `;
        }
    },
    
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    }
};

ThemeManager.init();

function toggleTheme() {
    ThemeManager.toggle();
}