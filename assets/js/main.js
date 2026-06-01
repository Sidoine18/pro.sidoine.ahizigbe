/* ============================================================
   main.js — Loader, Typewriter, Nav, Mobile Menu, Filter,
             Testimonials slider, Form, Scroll Progress
   ============================================================ */

(function () {
    'use strict';

    // ── LOADER ───────────────────────────────────────────────
    window.addEventListener('load', function () {
        const loader = document.getElementById('loader');
        if (!loader) return;
        setTimeout(() => loader.classList.add('done'), 1600);
    });


    // ── TYPEWRITER ───────────────────────────────────────────
    const twEl = document.getElementById('typewriter');
    const words = [
        'Froid & Climatisation',
        'Stratégie Digitale',
        'Création de Contenu',
        'Développement Web',
        'Entrepreneuriat',
    ];
    let wi = 0, ci = 0, deleting = false;

    function type() {
        if (!twEl) return;
        const word = words[wi];

        if (!deleting) {
            ci++;
            twEl.textContent = word.substring(0, ci);
            if (ci === word.length) {
                deleting = true;
                setTimeout(type, 2400);
                return;
            }
            setTimeout(type, 95);
        } else {
            ci--;
            twEl.textContent = word.substring(0, ci);
            if (ci === 0) {
                deleting = false;
                wi = (wi + 1) % words.length;
                setTimeout(type, 380);
                return;
            }
            setTimeout(type, 45);
        }
    }

    document.addEventListener('DOMContentLoaded', type);


    // ── HEADER SCROLL ────────────────────────────────────────
    const header = document.getElementById('header');
    let lastY = 0;

    function onScroll() {
        if (!header) return;
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 40);

        // Update scroll progress bar
        const prog = document.getElementById('scrollProgress');
        if (prog) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            prog.style.width = (y / total * 100) + '%';
        }

        // Active nav link
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        document.querySelectorAll('.nav-link[data-section]').forEach(a => {
            a.classList.toggle('active', a.dataset.section === current);
        });

        lastY = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });


    // ── MOBILE MENU ──────────────────────────────────────────
    const burger  = document.getElementById('burger');
    const overlay = document.getElementById('mobileOverlay');
    let menuOpen  = false;

    function toggleMobileMenu() {
        menuOpen = !menuOpen;
        burger && burger.classList.toggle('open', menuOpen);
        overlay && overlay.classList.toggle('open', menuOpen);
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }

    // Expose globally for inline onclick
    window.closeMobileMenu = function () {
        menuOpen = false;
        burger && burger.classList.remove('open');
        overlay && overlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (burger) burger.addEventListener('click', toggleMobileMenu);

    // Close on backdrop click
    if (overlay) {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) window.closeMobileMenu();
        });
    }

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // ── PROJECT FILTER ───────────────────────────────────────
    const filterTabs = document.querySelectorAll('.ftab');
    const pcards     = document.querySelectorAll('.pcard');

    filterTabs.forEach(btn => {
        btn.addEventListener('click', function () {
            filterTabs.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            pcards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                    // Tiny fade-in
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.4s, transform 0.4s';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });


    // ── TESTIMONIALS SLIDER ──────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const track  = document.getElementById('testiTrack');
        const prev   = document.getElementById('testiPrev');
        const next   = document.getElementById('testiNext');
        const dotsEl = document.getElementById('testiDots');
        if (!track) return;

        const cards = track.querySelectorAll('.testi-card');
        let current = 0;
        const total = cards.length;

        // Build dots
        if (dotsEl) {
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('div');
                dot.className = 'tc-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => goTo(i));
                dotsEl.appendChild(dot);
            }
        }

        function goTo(n) {
            current = (n + total) % total;
            // On mobile all visible; on desktop slide
            if (window.innerWidth > 880) {
                track.style.transform = `translateX(calc(-${current * (100 / total)}% - ${current * 24}px))`;
            }
            if (dotsEl) {
                dotsEl.querySelectorAll('.tc-dot').forEach((d, i) => d.classList.toggle('active', i === current));
            }
        }

        if (prev) prev.addEventListener('click', () => goTo(current - 1));
        if (next) next.addEventListener('click', () => goTo(current + 1));

        // Auto-advance every 5s
        let autoplay = setInterval(() => goTo(current + 1), 5000);
        track.addEventListener('mouseenter', () => clearInterval(autoplay));
        track.addEventListener('mouseleave', () => {
            autoplay = setInterval(() => goTo(current + 1), 5000);
        });
    });


    // ── CONTACT FORM ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        const form    = document.getElementById('contactForm');
        const success = document.getElementById('formSuccess');
        const submitBtn = document.getElementById('submitBtn');
        if (!form) return;

        function showErr(id, msg) {
            const el = document.getElementById(id);
            if (el) el.textContent = msg;
        }
        function clearErrs() {
            ['errName', 'errEmail', 'errMsg'].forEach(id => showErr(id, ''));
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrs();

            const name    = form.name.value.trim();
            const email   = form.email.value.trim();
            const message = form.message.value.trim();
            let valid = true;

            if (!name) { showErr('errName', 'Veuillez entrer votre nom.'); valid = false; }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showErr('errEmail', 'Veuillez entrer un email valide.'); valid = false;
            }
            if (!message || message.length < 10) {
                showErr('errMsg', 'Le message doit faire au moins 10 caractères.'); valid = false;
            }

            if (!valid) return;

            // Simulate sending (replace with real backend / EmailJS / Formspree)
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Envoi en cours…';
            submitBtn.style.opacity = '0.7';

            setTimeout(() => {
                submitBtn.style.display = 'none';
                if (success) {
                    success.style.display = 'flex';
                    success.style.alignItems = 'center';
                    success.style.gap = '10px';
                }
                form.reset();

                // Optional: open mailto as fallback
                const subject = encodeURIComponent(form.subject ? form.subject.value : 'Contact Portfolio');
                const body    = encodeURIComponent(`Nom: ${name}\n\n${message}`);
                window.location.href = `mailto:sidoineah964@gmail.com?subject=${subject}&body=${body}`;
            }, 1200);
        });
    });

})();
