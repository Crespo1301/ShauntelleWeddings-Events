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
    // Mobile nav toggle with body lock for cleaner small-screen behavior
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    // Close the menu after a navigation selection on mobile
    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });

    // Escape key support for accessibility
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      }
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
  let autoScrollTimer = null;

  function itemsPerPage() {
    if (!windowEl) return 1;
    return window.innerWidth <= 640 ? 2 : 4;
  }

  function maxPage() {
    return Math.max(0, thumbs.length - itemsPerPage());
  }

  function updateRailPosition() {
    const firstItem = thumbs[0];
    if (!firstItem) return;
    const itemWidth = firstItem.getBoundingClientRect().width;
    let gap = 0;
    const railStyles = window.getComputedStyle(rail);
    const cssGap = railStyles.getPropertyValue('--gallery-gap') ||
                   railStyles.getPropertyValue('column-gap') ||
                   railStyles.getPropertyValue('gap');

    if (cssGap) {
      gap = parseFloat(cssGap);
    } else {
      gap = 11.2;
    }

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

  function goPrevPage() {
    const max = maxPage();
    pageIndex = pageIndex <= 0 ? max : Math.max(0, pageIndex - itemsPerPage());
    updateRailPosition();
  }

  function goNextPage() {
    const max = maxPage();
    pageIndex = pageIndex >= max ? 0 : Math.min(max, pageIndex + itemsPerPage());
    updateRailPosition();
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function startAutoScroll() {
    stopAutoScroll();

    // Subtle luxury motion: only auto-scroll when not interacting with the lightbox
    if (!windowEl || thumbs.length <= itemsPerPage()) return;

    autoScrollTimer = window.setInterval(() => {
      if (lightbox?.hidden === false) return;
      goNextPage();
    }, 4200);
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
      setActive(index);
      stopAutoScroll();

      if (lightbox) {
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
      }
    });
  });

  prev?.addEventListener('click', () => {
    stopAutoScroll();
    goPrevPage();
    startAutoScroll();
  });

  next?.addEventListener('click', () => {
    stopAutoScroll();
    goNextPage();
    startAutoScroll();
  });

  windowEl?.addEventListener('mouseenter', stopAutoScroll);
  windowEl?.addEventListener('mouseleave', startAutoScroll);
  windowEl?.addEventListener('focusin', stopAutoScroll);
  windowEl?.addEventListener('focusout', startAutoScroll);

  lightboxPrev?.addEventListener('click', () => setActive(currentIndex - 1));
  lightboxNext?.addEventListener('click', () => setActive(currentIndex + 1));

  lightboxClose?.addEventListener('click', () => {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    startAutoScroll();
  });

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      startAutoScroll();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (lightbox?.hidden === false) {
      if (event.key === 'Escape') {
        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        startAutoScroll();
      }
      if (event.key === 'ArrowLeft') setActive(currentIndex - 1);
      if (event.key === 'ArrowRight') setActive(currentIndex + 1);
    }
  });

  window.addEventListener('resize', () => {
    updateRailPosition();
    startAutoScroll();
  });

  setActive(0);
  updateRailPosition();
  startAutoScroll();
}

async function initSite() {
  await includePartials();
  initNavigation();
  initGalleryRail();
}

initSite();
