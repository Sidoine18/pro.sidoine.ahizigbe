/* ============================================================
   theme.js — Dark/Light mode toggle
   Reads system preference on first load, saves to localStorage
   ============================================================ */

(function () {
    'use strict';

    const STORAGE_KEY = 'sidoine-theme';
    const html = document.documentElement;

    // Detect preferred theme
    function getPreferred() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update icon once DOM is ready
        const updateIcon = () => {
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateIcon);
        } else {
            updateIcon();
        }
    }

    // Apply immediately (before DOM paint to avoid flash)
    applyTheme(getPreferred());

    // Toggle handler — attached after DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            const current = html.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);

            // Quick scale animation on button
            btn.style.transform = 'scale(0.82)';
            setTimeout(() => { btn.style.transform = ''; }, 200);
        });
    });
})();
