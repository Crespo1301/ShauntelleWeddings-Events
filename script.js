async function includePartials() {
  const includeNodes = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(
    includeNodes.map(async (node) => {
      const path = node.getAttribute('data-include');
      const response = await fetch(path);
      node.outerHTML = await response.text();
    })
  );
}

function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const page = document.body.dataset.page;
  document.querySelectorAll('[data-page-link]').forEach((link) => {
    link.classList.toggle('active', link.dataset.pageLink === page);
  });
}

function initGalleryRail() {
  const rail = document.querySelector('[data-gallery]');
  if (!rail) return;

  const windowEl = document.querySelector('.gallery-rail-window');
  const prev = document.querySelector('[data-gallery-rail-prev]');
  const next = document.querySelector('[data-gallery-rail-next]');
  const thumbs = Array.from(document.querySelectorAll('[data-gallery-thumb]'));
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  let currentIndex = 0;
  let pageIndex = 0;

  function itemsPerPage() {
    if (!windowEl) return 1;
    return window.innerWidth <= 640 ? 2 : 4;
  }

  function updateRailPosition() {
    const firstItem = thumbs[0];
    if (!firstItem) return;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const gap = 11.2;
    rail.style.transform = `translateX(-${pageIndex * (itemWidth + gap)}px)`;
  }

  function setActive(index) {
    currentIndex = (index + thumbs.length) % thumbs.length;
    thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === currentIndex));
    const img = thumbs[currentIndex].querySelector('img');
    if (lightboxImage && img) {
      lightboxImage.src = thumbs[currentIndex].dataset.full || img.getAttribute('src');
      lightboxImage.alt = img.getAttribute('alt') || 'Gallery image';
    }
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      setActive(index);
      if (lightbox) {
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
      }
    });
  });

  prev?.addEventListener('click', () => {
    const maxPage = Math.max(0, thumbs.length - itemsPerPage());
    pageIndex = Math.max(0, pageIndex - itemsPerPage());
    pageIndex = Math.min(pageIndex, maxPage);
    updateRailPosition();
  });

  next?.addEventListener('click', () => {
    const maxPage = Math.max(0, thumbs.length - itemsPerPage());
    pageIndex = Math.min(maxPage, pageIndex + itemsPerPage());
    updateRailPosition();
  });

  lightboxPrev?.addEventListener('click', () => setActive(currentIndex - 1));
  lightboxNext?.addEventListener('click', () => setActive(currentIndex + 1));
  lightboxClose?.addEventListener('click', () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
  });

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (lightbox?.hidden === false) {
      if (event.key === 'Escape') {
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
      }
      if (event.key === 'ArrowLeft') setActive(currentIndex - 1);
      if (event.key === 'ArrowRight') setActive(currentIndex + 1);
    }
  });

  window.addEventListener('resize', updateRailPosition);
  setActive(0);
  updateRailPosition();
}

async function initSite() {
  await includePartials();
  initNavigation();
  initGalleryRail();
}

initSite();
