/* ============================================================
   animations.js — GSAP ScrollTrigger + Canvas BG + Cursor
   ============================================================ */

(function () {
    'use strict';

    // ── 1. CANVAS BACKGROUND (Particles + Orbs) ──────────────
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 30 : 60;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x  = Math.random() * W;
            this.y  = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.r  = Math.random() * 1.5 + 0.4;
            this.alpha = Math.random() * 0.4 + 0.05;
            this.color = Math.random() > 0.5 ? '108,99,255' : '0,212,255';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    // Connection lines between nearby particles
    function drawLines() {
        const DIST = 110;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108,99,255,${0.07 * (1 - d / DIST)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    let raf;
    function tick() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        raf = requestAnimationFrame(tick);
    }
    tick();

    // Pause canvas when tab hidden (performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else tick();
    });


    // ── 2. GSAP SCROLL ANIMATIONS ────────────────────────────
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            // Fallback: just show everything if GSAP not loaded
            document.querySelectorAll('.gsap-reveal, .gsap-stagger > *').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.filter = 'none';
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Check reduced motion
        const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (noMotion) {
            document.querySelectorAll('.gsap-reveal, .gsap-stagger > *').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.filter = 'none';
            });
            return;
        }

        // Reveal elements
        document.querySelectorAll('.gsap-reveal').forEach(el => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'power3.out',
            });
        });

        // Stagger children
        document.querySelectorAll('.gsap-stagger').forEach(container => {
            const children = container.children;
            gsap.to(children, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.09,
            });
        });

        // Skill bars — animate width when in view
        document.querySelectorAll('.sb-fill').forEach(bar => {
            const targetW = bar.getAttribute('data-width') + '%';
            ScrollTrigger.create({
                trigger: bar,
                start: 'top 90%',
                onEnter: () => { bar.style.width = targetW; },
            });
        });

        // Hero title lines — stagger on load
        const heroLines = document.querySelectorAll('.title-line');
        if (heroLines.length) {
            gsap.from(heroLines, {
                y: 80,
                opacity: 0,
                duration: 1,
                ease: 'power4.out',
                stagger: 0.12,
                delay: 1.8,
            });
        }

        // Hero content fade
        const heroEls = [
            '.hero-badge',
            '.hero-typewriter',
            '.hero-desc',
            '.hero-actions',
            '.hero-stats',
        ];
        gsap.from(heroEls.join(','), {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            delay: 2.0,
        });

        // Photo entrance
        gsap.from('.photo-container', {
            scale: 0.88,
            opacity: 0,
            duration: 1.1,
            ease: 'power3.out',
            delay: 1.9,
        });

        // Floating badges
        gsap.from('.photo-badge', {
            x: -20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.2,
            delay: 2.4,
        });
    }

    // Wait for GSAP to load (it's deferred)
    if (typeof gsap !== 'undefined') {
        document.addEventListener('DOMContentLoaded', initGSAP);
    } else {
        window.addEventListener('load', initGSAP);
    }

    // ── 3. CURSOR GLOW ───────────────────────────────────────
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 880) {
        let cx = 0, cy = 0;
        let tx = 0, ty = 0;

        document.addEventListener('mousemove', e => {
            tx = e.clientX;
            ty = e.clientY;
        });

        function animCursor() {
            cx += (tx - cx) * 0.08;
            cy += (ty - cy) * 0.08;
            cursorGlow.style.left = cx + 'px';
            cursorGlow.style.top  = cy + 'px';
            requestAnimationFrame(animCursor);
        }
        animCursor();

        // Spotlight on cards
        document.querySelectorAll('.pcard, .service-card, .acard').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width)  * 100;
                const y = ((e.clientY - rect.top)  / rect.height) * 100;
                card.style.setProperty('--mx', x + '%');
                card.style.setProperty('--my', y + '%');
            });
        });
    }

})();
