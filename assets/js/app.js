/**
 * Password Security Hub — Global Application Script
 * Theme toggle, mobile nav, keyboard shortcuts, accordion, dropdown
 */

(function() {
  'use strict';

  // ===== Theme Toggle =====
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('psh-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    // If no saved theme, rely on prefers-color-scheme in CSS

    toggle.addEventListener('click', () => {
      document.documentElement.classList.add('theme-transition');

      const isDark = document.documentElement.classList.contains('dark') ||
                     (!document.documentElement.classList.contains('light') && prefersDark);

      if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('psh-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('psh-theme', 'dark');
      }

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    });
  }

  // ===== Mobile Navigation =====
  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');

    if (!hamburger || !mobileNav) return;

    function openNav() {
      hamburger.classList.add('active');
      mobileNav.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.classList.add('nav-open');
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeNav);
    }

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeNav();
      }
    });
  }

  // ===== Desktop Dropdown =====
  function initDropdown() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-dropdown__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');

        // Close all dropdowns
        dropdowns.forEach(d => d.classList.remove('open'));

        if (!isOpen) {
          dropdown.classList.add('open');
        }
      });
    });

    // Close on click outside
    document.addEventListener('click', () => {
      dropdowns.forEach(d => d.classList.remove('open'));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdowns.forEach(d => d.classList.remove('open'));
      }
    });
  }

  // ===== Accordion =====
  function initAccordions() {
    document.querySelectorAll('.accordion__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const content = trigger.nextElementSibling;
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close all in same accordion
        const accordion = trigger.closest('.accordion');
        if (accordion) {
          accordion.querySelectorAll('.accordion__trigger').forEach(t => {
            t.setAttribute('aria-expanded', 'false');
            const c = t.nextElementSibling;
            if (c) c.classList.remove('active');
          });
        }

        if (!isExpanded) {
          trigger.setAttribute('aria-expanded', 'true');
          if (content) content.classList.add('active');
        }
      });
    });
  }

  // ===== Keyboard Shortcuts =====
  function initKeyboardShortcuts() {
    const shortcutsModal = document.getElementById('shortcuts-modal');

    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (e.target.matches('input, textarea, select')) return;

      // ? — Show shortcuts modal
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (shortcutsModal) {
          shortcutsModal.classList.toggle('active');
        }
        return;
      }

      // Ctrl/Cmd + G — Generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        const generateBtn = document.querySelector('[data-action="generate"]') ||
                           document.querySelector('.btn--primary');
        if (generateBtn) generateBtn.click();
        return;
      }

      // Ctrl/Cmd + Shift + D — Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.click();
        return;
      }

      // Escape — Close modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => {
          m.classList.remove('active');
        });
      }
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

    // Close buttons
    document.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-backdrop').classList.remove('active');
      });
    });
  }

  // ===== Password Visibility Toggle =====
  function initVisibilityToggles() {
    document.querySelectorAll('[data-toggle-visibility]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-visibility');
        const target = document.getElementById(targetId);
        if (!target) return;

        if (target.type === 'password') {
          target.type = 'text';
          btn.setAttribute('aria-label', 'Hide password');
          btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
        } else {
          target.type = 'password';
          btn.setAttribute('aria-label', 'Show password');
          btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        }
      });
    });

    // For password display elements (not inputs)
    document.querySelectorAll('[data-toggle-display]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-display');
        const target = document.getElementById(targetId);
        if (!target) return;

        target.classList.toggle('password-display__text--hidden');
        const isHidden = target.classList.contains('password-display__text--hidden');
        btn.setAttribute('aria-label', isHidden ? 'Show password' : 'Hide password');
      });
    });
  }

  // ===== Stepper Controls =====
  function initSteppers() {
    document.querySelectorAll('.stepper').forEach(stepper => {
      const input = stepper.querySelector('.stepper__value');
      const minBtn = stepper.querySelector('[data-stepper="minus"]');
      const plusBtn = stepper.querySelector('[data-stepper="plus"]');

      if (!input || !minBtn || !plusBtn) return;

      const min = parseInt(input.getAttribute('min')) || 1;
      const max = parseInt(input.getAttribute('max')) || 100;

      function update(value) {
        const clamped = Math.max(min, Math.min(max, value));
        input.value = clamped;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      minBtn.addEventListener('click', () => update(parseInt(input.value) - 1));
      plusBtn.addEventListener('click', () => update(parseInt(input.value) + 1));
      input.addEventListener('change', () => update(parseInt(input.value) || min));
    });
  }

  // ===== Initialize Everything =====
  function init() {
    initTheme();
    initMobileNav();
    initDropdown();
    initAccordions();
    initKeyboardShortcuts();
    initVisibilityToggles();
    initSteppers();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
