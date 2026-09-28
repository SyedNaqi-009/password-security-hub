/**
 * Password Security Hub — Global App JavaScript
 */
(function() {
  'use strict';

  // ===== Theme Management =====
  function initTheme() {
    const toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-btn, .theme-toggle');
    const savedTheme = localStorage.getItem('psh-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('psh-theme', isDark ? 'dark' : 'light');
      });
    });
  }

  // ===== Mobile Drawer Navigation =====
  function initMobileNav() {
    const hamburger = document.getElementById('hamburger') || document.getElementById('mobile-menu-btn') || document.querySelector('.hamburger');
    const mobileNav = document.getElementById('mobile-nav') || document.querySelector('.mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop') || document.querySelector('.mobile-nav__backdrop');
    const closeBtn = document.getElementById('close-mobile-nav') || document.querySelector('.close-mobile-nav');

    function openMenu() {
      if (mobileNav) mobileNav.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      if (hamburger) hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (mobileNav) mobileNav.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      if (hamburger) hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        if (mobileNav && mobileNav.classList.contains('open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===== Dropdown Menus =====
  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown, .dropdown').forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-dropdown__trigger, .dropdown-trigger, a[href="#"]');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.nav-dropdown, .dropdown').forEach(d => d.classList.remove('open'));
        if (!isOpen) dropdown.classList.add('open');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.nav-dropdown, .dropdown').forEach(d => d.classList.remove('open'));
    });
  }

  // ===== Accordions =====
  function initAccordions() {
    document.querySelectorAll('.accordion__trigger, .accordion-header').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.accordion__item, .accordion-item') || btn.parentElement;
        const content = item.querySelector('.accordion__content, .accordion-content') || btn.nextElementSibling;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', !isExpanded);
        if (content) {
          content.classList.toggle('active', !isExpanded);
        }
      });
    });
  }

  // ===== Service Worker Registration =====
  function initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.log('SW registration note:', err);
        });
      });
    }
  }

  // Initialize
  function init() {
    initTheme();
    initMobileNav();
    initDropdowns();
    initAccordions();
    initServiceWorker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
