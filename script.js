// Navigation stays native; links never wait for a scroll animation.
const menu = document.querySelector('.menu-toggle');
const header = document.querySelector('.site-header');

function closeMenu() {
  menu?.setAttribute('aria-expanded', 'false');
  header?.classList.remove('menu-open');
}

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  header.classList.toggle('menu-open', open);
});
document.querySelectorAll('.site-nav a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

// Each photograph also has a normal image link when JavaScript is unavailable.
// The modal lives outside the story's moving and revealing wrappers.
const dialog = document.querySelector('.lightbox');
const gallery = [...document.querySelectorAll('[data-gallery]')];
let galleryIndex = 0;
let galleryTrigger;
let previousBodyOverflow = '';

function showPhotograph(index) {
  galleryIndex = (index + gallery.length) % gallery.length;
  const link = gallery[galleryIndex];
  const image = dialog.querySelector('img');
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  dialog.querySelector('.lightbox-caption').textContent = link.dataset.caption;
  dialog.querySelector('.lightbox-source').href = link.dataset.source;
  dialog.querySelector('.lightbox-count').textContent = `${galleryIndex + 1} / ${gallery.length}`;
}

gallery.forEach((link, index) => {
  link.addEventListener('click', event => {
    if (!dialog?.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    galleryTrigger = link;
    showPhotograph(index);
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  });
});
dialog?.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog?.querySelector('[data-previous]').addEventListener('click', () => showPhotograph(galleryIndex - 1));
dialog?.querySelector('[data-next]').addEventListener('click', () => showPhotograph(galleryIndex + 1));
dialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showPhotograph(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    dialog.close();
  }
});
dialog?.addEventListener('close', () => {
  document.body.style.overflow = previousBodyOverflow;
  galleryTrigger?.focus({ preventScroll: true });
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const hasSize = rect => rect.width > 0 && rect.height > 0;
const storyMemory = { revealed: new WeakSet(), progress: new WeakMap() };

// Adapted from the user's Academy reference: once-only entrances, remembered
// path progress and small opposing drift. There is no pinned scene, synthetic
// scroll position, continuous animation loop or transition chasing scroll values.
function connectScrollStory(root, reducedMotion, memory) {
  if (!root) return () => {};
  const supported = 'IntersectionObserver' in window && 'requestAnimationFrame' in window;
  const animate = supported && !reducedMotion;
  const reveals = [...root.querySelectorAll('[data-story-reveal]')];
  const scenes = [...root.querySelectorAll('[data-story-scene]')];
  const activeScenes = new Set();
  const pending = new Set();
  let disposed = false;
  let frame = null;
  let previousScrollY = scrollY;
  let revealObserver;
  let sceneObserver;
  let resizeObserver;

  function reveal(element) {
    memory.revealed.add(element);
    pending.delete(element);
    element.classList.remove('story-pending');
    element.classList.add('story-revealed');
    revealObserver?.unobserve(element);
  }

  function paintScene(element, rect, viewportHeight) {
    // Hidden desktop/mobile connector windows must not become permanently
    // complete merely because display:none gives them a zero rectangle.
    if (!hasSize(rect)) return;
    const reached = clamp((viewportHeight * .85 - rect.top) / rect.height, 0, 1);
    const progress = Math.max(memory.progress.get(element) || 0, reached);
    const drift = clamp(
      (viewportHeight / 2 - (rect.top + rect.height / 2)) / ((viewportHeight + rect.height) / 2),
      -1, 1
    ) * 18;
    memory.progress.set(element, progress);
    element.style.setProperty('--story-progress', String(progress));
    element.style.setProperty('--story-drift', `${drift.toFixed(2)}px`);
  }

  function update() {
    frame = null;
    if (disposed) return;
    const height = innerHeight;
    // Geometry is read in one batch before any style writes. Only intersecting
    // scenes are measured during scroll; the stable parent drives each image.
    const jumped = Math.abs(scrollY - previousScrollY) > height;
    const positions = (jumped ? scenes : [...activeScenes])
      .map(element => [element, element.getBoundingClientRect()]);
    // A jump longer than the viewport can skip an unseen target without changing
    // its intersection state. Inspect pending entrances only on those large jumps.
    const skippedEntrances = jumped
      ? [...pending].map(element => [element, element.getBoundingClientRect()])
      : [];
    previousScrollY = scrollY;
    for (const [element, rect] of positions) {
      if (hasSize(rect) && ((rect.bottom > 0 && rect.top < height) || (jumped && rect.bottom <= 0))) {
        paintScene(element, rect, height);
      }
    }
    for (const [element, rect] of skippedEntrances) {
      if (hasSize(rect) && rect.bottom <= 0) reveal(element);
    }
  }

  function schedule() {
    if (!disposed && animate && (activeScenes.size || Math.abs(scrollY - previousScrollY) > innerHeight) && frame === null) {
      frame = requestAnimationFrame(update);
    }
  }

  function onFocus(event) {
    let element = event.target;
    while (element && root.contains(element)) {
      if (pending.has(element)) reveal(element);
      element = element.parentElement;
    }
  }

  if (animate) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        // A fast jump can pass a whole photograph between observer deliveries.
        // On reverse scroll it should already be readable, without a late entrance.
        if (entry.isIntersecting || (hasSize(entry.boundingClientRect) && entry.boundingClientRect.bottom <= 0)) {
          reveal(entry.target);
        }
      }
    });
    sceneObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const rect = entry.boundingClientRect;
        if (entry.isIntersecting && hasSize(rect)) {
          activeScenes.add(entry.target);
        } else {
          activeScenes.delete(entry.target);
          if (hasSize(rect) && rect.bottom <= 0) {
            memory.progress.set(entry.target, 1);
            entry.target.style.setProperty('--story-progress', '1');
            // Completing a whole scene also completes its missed entrances.
            for (const element of [...pending]) {
              if (entry.target.contains(element)) reveal(element);
            }
          }
        }
      }
      schedule();
    });
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(root);
    }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    root.addEventListener('focusin', onFocus);
  }

  // Measure every target before preparing any entrance styles.
  const height = innerHeight;
  const revealRects = animate ? reveals.map(element => [element, element.getBoundingClientRect()]) : [];
  const sceneRects = animate ? scenes.map(element => [element, element.getBoundingClientRect()]) : [];
  root.classList.toggle('story-animated', animate);
  if (!animate) {
    reveals.forEach(reveal);
    scenes.forEach(element => {
      memory.progress.set(element, 1);
      element.style.setProperty('--story-progress', '1');
      element.style.setProperty('--story-drift', '0px');
    });
  } else {
    for (const [element, rect] of revealRects) {
      if (!memory.revealed.has(element) && hasSize(rect) && rect.top >= height) {
        pending.add(element);
        element.classList.add('story-pending');
        revealObserver.observe(element);
      } else {
        reveal(element);
      }
    }
    for (const [element, rect] of sceneRects) {
      paintScene(element, rect, height);
      if (hasSize(rect) && rect.bottom > 0 && rect.top < height) activeScenes.add(element);
      sceneObserver.observe(element);
      resizeObserver?.observe(element);
    }
    schedule();
  }

  return () => {
    disposed = true;
    root.classList.remove('story-animated');
    revealObserver?.disconnect();
    sceneObserver?.disconnect();
    resizeObserver?.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    root.removeEventListener('focusin', onFocus);
    reveals.forEach(element => element.classList.remove('story-pending', 'story-revealed'));
    scenes.forEach(element => {
      element.style.removeProperty('--story-progress');
      element.style.removeProperty('--story-drift');
    });
    activeScenes.clear();
  };
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let disconnectStory = connectScrollStory(document.querySelector('.story-section'), reducedMotion.matches, storyMemory);
reducedMotion.addEventListener('change', () => {
  disconnectStory();
  disconnectStory = connectScrollStory(document.querySelector('.story-section'), reducedMotion.matches, storyMemory);
});

// The thin page indicator is independent of story paths and also uses one
// event-coalesced frame. It never controls the document's actual scroll position.
const progressBar = document.querySelector('.progress');
let progressFrame = null;
function updatePageProgress() {
  progressFrame = null;
  const distance = document.documentElement.scrollHeight - innerHeight;
  const progress = distance > 0 ? clamp(scrollY / distance, 0, 1) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
}
function schedulePageProgress() {
  if (progressFrame === null) progressFrame = requestAnimationFrame(updatePageProgress);
}
addEventListener('scroll', schedulePageProgress, { passive: true });
addEventListener('resize', schedulePageProgress, { passive: true });
updatePageProgress();
