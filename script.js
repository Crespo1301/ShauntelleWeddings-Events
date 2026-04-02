async function includePartials(root = document) {
  let includeNodes = Array.from(root.querySelectorAll('[data-include]'));

  // Resolve nested partials by continuing until no include placeholders remain.
  while (includeNodes.length) {
    await Promise.all(
      includeNodes.map(async (node) => {
        const path = node.getAttribute('data-include');
        const response = await fetch(path);
        node.outerHTML = await response.text();
      })
    );

    includeNodes = Array.from(document.querySelectorAll('[data-include]'));
  }
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
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');

  let currentIndex = 0;
  let pageIndex = 0;
  let autoScrollTimer = null;
  let isJumping = false;

  const originalThumbs = Array.from(rail.querySelectorAll('[data-gallery-thumb]'));

  function getRowsPerPage() {
    return 2;
  }

  function getColumnsPerPage() {
    if (!windowEl) return 1;
    const firstItem = rail.querySelector('[data-gallery-thumb]');
    if (!firstItem) return 1;
    const itemRect = firstItem.getBoundingClientRect();
    const railStyles = window.getComputedStyle(rail);
    const cssGap = railStyles.getPropertyValue('--gallery-gap') ||
      railStyles.getPropertyValue('column-gap') ||
      railStyles.getPropertyValue('gap');
    const gap = cssGap ? parseFloat(cssGap) : 11.2;
    const windowWidth = windowEl.getBoundingClientRect().width;
    return Math.max(1, Math.floor((windowWidth + gap) / (itemRect.width + gap)));
  }

  function getItemsPerPage() {
    return getRowsPerPage() * getColumnsPerPage();
  }

  function getGap() {
    const railStyles = window.getComputedStyle(rail);
    const cssGap = railStyles.getPropertyValue('--gallery-gap') ||
      railStyles.getPropertyValue('column-gap') ||
      railStyles.getPropertyValue('gap');
    return cssGap ? parseFloat(cssGap) : 11.2;
  }

  function clearClones() {
    rail.querySelectorAll('[data-gallery-clone="true"]').forEach((node) => node.remove());
  }

  function buildInfiniteRail() {
    clearClones();

    const itemsPerPage = getItemsPerPage();
    if (originalThumbs.length <= itemsPerPage) {
      pageIndex = 0;
      return;
    }

    const prependCount = Math.min(itemsPerPage, originalThumbs.length);
    const appendCount = Math.min(itemsPerPage, originalThumbs.length);

    // Clone the last visible set to the front
    originalThumbs.slice(-prependCount).forEach((thumb) => {
      const clone = thumb.cloneNode(true);
      clone.dataset.galleryClone = 'true';
      clone.dataset.originalIndex = thumb.dataset.originalIndex || '';
      rail.insertBefore(clone, rail.firstChild);
    });

    // Clone the first visible set to the end
    originalThumbs.slice(0, appendCount).forEach((thumb) => {
      const clone = thumb.cloneNode(true);
      clone.dataset.galleryClone = 'true';
      clone.dataset.originalIndex = thumb.dataset.originalIndex || '';
      rail.appendChild(clone);
    });

    // Start on the first real page after the prepended clones
    pageIndex = getColumnsPerPage();
  }

  function getAllThumbs() {
    return Array.from(rail.querySelectorAll('[data-gallery-thumb]'));
  }

  function updateRailPosition(useTransition = true) {
    const thumbs = getAllThumbs();
    const firstItem = thumbs[0];
    if (!firstItem) return;

    const itemWidth = firstItem.getBoundingClientRect().width;
    const gap = getGap();

    rail.style.transition = useTransition
      ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';

    rail.style.transform = `translateX(-${pageIndex * (itemWidth + gap)}px)`;
  }

  function setLightboxImage(index) {
    const sourceThumb = originalThumbs[(index + originalThumbs.length) % originalThumbs.length];
    if (!sourceThumb) return;
    const img = sourceThumb.querySelector('img');
    currentIndex = (index + originalThumbs.length) % originalThumbs.length;

    getAllThumbs().forEach((thumb) => {
      const originalIndex = Number(thumb.dataset.originalIndex);
      thumb.classList.toggle('is-active', originalIndex === currentIndex);
    });

    if (lightboxImage && img) {
      lightboxImage.src = sourceThumb.dataset.full || img.getAttribute('src');
      lightboxImage.alt = img.getAttribute('alt') || 'Gallery image';
    }
  }

  function attachThumbHandlers() {
    getAllThumbs().forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const originalIndex = Number(thumb.dataset.originalIndex);
        setLightboxImage(originalIndex);
        stopAutoScroll();

        if (lightbox) {
          lightbox.hidden = false;
          document.body.classList.add('lightbox-open');
        }
      });
    });
  }

  function jumpIfNeeded() {
    const itemsPerPage = getItemsPerPage();
    const columnsPerPage = getColumnsPerPage();
    const maxRealPageIndex = columnsPerPage + Math.max(0, originalThumbs.length - itemsPerPage);

    if (pageIndex < columnsPerPage) {
      // Jump from prepended clones to the matching real page
      pageIndex = maxRealPageIndex;
      isJumping = true;
      updateRailPosition(false);
    } else if (pageIndex > maxRealPageIndex) {
      // Jump from appended clones back to the first real page
      pageIndex = columnsPerPage;
      isJumping = true;
      updateRailPosition(false);
    }
  }

  function goPrevPage() {
    pageIndex -= getColumnsPerPage();
    updateRailPosition(true);
  }

  function goNextPage() {
    pageIndex += getColumnsPerPage();
    updateRailPosition(true);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      window.clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function startAutoScroll() {
    stopAutoScroll();

    if (!windowEl || originalThumbs.length <= getItemsPerPage()) return;

    autoScrollTimer = window.setInterval(() => {
      if (lightbox?.hidden === false) return;
      goNextPage();
    }, 4200);
  }

  // Preserve original indexes so clones can still map to the real image data
  originalThumbs.forEach((thumb, index) => {
    thumb.dataset.originalIndex = String(index);
  });

  buildInfiniteRail();
  attachThumbHandlers();
  setLightboxImage(0);
  updateRailPosition(false);
  startAutoScroll();

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

  rail.addEventListener('transitionend', () => {
    if (isJumping) {
      isJumping = false;
      rail.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
      return;
    }
    jumpIfNeeded();
  });

  windowEl?.addEventListener('mouseenter', stopAutoScroll);
  windowEl?.addEventListener('mouseleave', startAutoScroll);
  windowEl?.addEventListener('focusin', stopAutoScroll);
  windowEl?.addEventListener('focusout', startAutoScroll);

  lightboxPrev?.addEventListener('click', () => setLightboxImage(currentIndex - 1));
  lightboxNext?.addEventListener('click', () => setLightboxImage(currentIndex + 1));

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
      if (event.key === 'ArrowLeft') setLightboxImage(currentIndex - 1);
      if (event.key === 'ArrowRight') setLightboxImage(currentIndex + 1);
    }
  });

  window.addEventListener('resize', () => {
    stopAutoScroll();
    buildInfiniteRail();
    attachThumbHandlers();
    updateRailPosition(false);
    startAutoScroll();
  });
}

async function initSite() {
  await includePartials();
  initNavigation();
  initGalleryRail();
}

initSite();
