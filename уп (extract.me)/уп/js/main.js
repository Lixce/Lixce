/**
 * Ленивая загрузка при скролле:
 * 1) Секции появляются с fade-in когда входят во viewport
 * 2) Картинки подгружаются только когда секция становится видимой
 */

(function () {
  'use strict';

  const sections = document.querySelectorAll('.lazy-section');
  const images = document.querySelectorAll('.lazy-image');

  /* --- Загрузка одной картинки по data-src --- */
  function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src || img.classList.contains('is-loaded')) return;

    const temp = new Image();
    temp.onload = function () {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('is-loaded');
    };
    temp.onerror = function () {
      /* Если файла нет — всё равно показываем блок */
      img.classList.add('is-loaded');
    };
    temp.src = src;
  }

  /* --- Observer для секций --- */
  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const section = entry.target;
        section.classList.add('is-visible');

        section.querySelectorAll('.lazy-image').forEach(loadImage);

        sectionObserver.unobserve(section);
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12,
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* --- Первая секция (hero) — показать сразу при загрузке --- */
  const hero = document.getElementById('hero');
  if (hero) {
    requestAnimationFrame(function () {
      hero.classList.add('is-visible');
      hero.querySelectorAll('.lazy-image').forEach(loadImage);
      sectionObserver.unobserve(hero);
    });

    /* Скрыть фиксированное фото, когда hero полностью ушёл с экрана */
    const heroEndObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          hero.classList.toggle('is-past', entry.intersectionRatio === 0);
        });
      },
      { threshold: 0 }
    );
    heroEndObserver.observe(hero);
  }

  /* --- Плавная подсветка активного пункта навигации --- */
  const navLinks = document.querySelectorAll('.nav a');
  const navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.style.opacity =
            link.getAttribute('href') === '#' + id ? '1' : '0.6';
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(function (section) {
    if (section.id) navObserver.observe(section);
  });
})();
