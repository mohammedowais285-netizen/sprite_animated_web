// Thums Up Rose Scroll Animation Controller
// Canvas animation plays over the scroll-spacer zone, then content sections appear.

const frameCount = 210;
const currentFramePath = (index) => `/frames/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const canvas = document.getElementById('scroll-canvas');
const context = canvas.getContext('2d');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const scrollOverlay = document.getElementById('scroll-overlay');
const heroOverlay = document.getElementById('hero-overlay');
const scrollSpacer = document.getElementById('scroll-spacer');
const animationContainer = document.getElementById('animation-container');

const images = [];
let loadedCount = 0;
let targetFrameIndex = 0;
let smoothFrameIndex = 0;

// Preload all frames
const preloadImages = (callback) => {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFramePath(i);
    img.onload = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / frameCount) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.innerText = `${percent}%`;
      
      if (loadedCount === frameCount) {
        setTimeout(callback, 400);
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === frameCount) {
        setTimeout(callback, 400);
      }
    };
    images.push(img);
  }
};

// Canvas Resize Logic (Aspect Ratio Cover + High Quality backings)
const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  
  context.scale(dpr, dpr);
  
  // High quality rendering settings - MUST be reset on resize
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  
  renderFrame(Math.round(smoothFrameIndex));
};

// Render specific frame onto Canvas with cover scaling
const renderFrame = (index) => {
  const imgIndex = Math.max(0, Math.min(frameCount - 1, index));
  const img = images[imgIndex];
  
  if (!img || !img.complete) return;
  
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const imgWidth = img.naturalWidth || 1280;
  const imgHeight = img.naturalHeight || 720;
  
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    drawWidth = canvasHeight * imgRatio;
    drawHeight = canvasHeight;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }
  
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
};

// The scroll-spacer height defines the "animation zone".
// Only scroll within this zone maps to frames.
// Once the user scrolls past the spacer, the animation stays on the last frame
// and the canvas fades out so content sections are visible.
const updateScrollState = () => {
  const scrollTop = window.scrollY;
  const spacerHeight = scrollSpacer.offsetHeight;
  // The max scroll position for the animation is the bottom of the spacer minus one viewport
  const animScrollMax = spacerHeight - window.innerHeight;
  
  if (animScrollMax <= 0) return;
  
  // Clamp scroll position to the animation zone
  const clampedScroll = Math.min(scrollTop, animScrollMax);
  
  // Map to frame index
  targetFrameIndex = Math.min(
    frameCount - 1,
    Math.floor((clampedScroll / animScrollMax) * frameCount)
  );
  
  // Fade out scroll indicator
  const fadeStart = 0;
  const fadeEnd = 250;
  let indicatorOpacity = 1 - (scrollTop - fadeStart) / (fadeEnd - fadeStart);
  indicatorOpacity = Math.max(0, Math.min(1, indicatorOpacity));
  scrollOverlay.style.opacity = indicatorOpacity;
  scrollOverlay.style.display = indicatorOpacity === 0 ? 'none' : 'block';
  
  // Fade out hero overlay at 30% of scroll animation zone
  const progress = clampedScroll / animScrollMax;
  let heroOpacity = 1 - (progress / 0.3);
  heroOpacity = Math.max(0, Math.min(1, heroOpacity));
  if (heroOverlay) {
    heroOverlay.style.opacity = heroOpacity;
    heroOverlay.style.display = heroOpacity === 0 ? 'none' : 'flex';
  }
  
  // Fade out canvas when user enters the content sections (past the spacer)
  const fadeOutStart = animScrollMax - 100;
  const fadeOutEnd = animScrollMax + 100;
  if (scrollTop > fadeOutStart) {
    let canvasOpacity = 1 - ((scrollTop - fadeOutStart) / (fadeOutEnd - fadeOutStart));
    canvasOpacity = Math.max(0, Math.min(1, canvasOpacity));
    animationContainer.style.opacity = canvasOpacity;
  } else {
    animationContainer.style.opacity = 1;
  }
};

// Lerp loop for buttery-smooth animations
const animationLoop = () => {
  const diff = targetFrameIndex - smoothFrameIndex;
  
  if (Math.abs(diff) > 0.01) {
    smoothFrameIndex += diff * 0.1;
    renderFrame(Math.round(smoothFrameIndex));
  }
  
  requestAnimationFrame(animationLoop);
};

// --- Sticky navigation ---
const NAV_OFFSET = 88;
const navSections = [
  { id: 'experience', el: () => document.getElementById('experience') },
  { id: 'story', el: () => document.getElementById('story') },
  { id: 'benefits', el: () => document.getElementById('benefits') },
  { id: 'gallery', el: () => document.getElementById('gallery') },
  { id: 'reviews', el: () => document.getElementById('reviews') },
  { id: 'ingredients', el: () => document.getElementById('ingredients') },
  { id: 'shop', el: () => document.getElementById('shop') },
  { id: 'find-us', el: () => document.getElementById('find-us') },
];

const scrollToSection = (hash) => {
  const id = (hash || '').replace('#', '');
  if (!id) return;

  if (id === 'experience') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
};

const closeMobileNav = () => {
  const menu = document.getElementById('nav-mobile-menu');
  const toggle = document.getElementById('nav-menu-toggle');
  if (!menu || !toggle) return;
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.querySelector('.nav-icon-menu')?.classList.remove('hidden');
  toggle.querySelector('.nav-icon-close')?.classList.add('hidden');
};

const updateActiveNavLink = () => {
  const scrollY = window.scrollY + NAV_OFFSET + 40;
  let activeId = 'experience';

  for (const section of navSections) {
    const el = section.el();
    if (el && el.offsetTop <= scrollY) {
      activeId = section.id;
    }
  }

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === `#${activeId}`;
    link.classList.toggle('is-active', isActive);
  });
};

const initNavigation = () => {
  const globalNav = document.getElementById('global-nav');
  const menuToggle = document.getElementById('nav-menu-toggle');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      scrollToSection(href);
      closeMobileNav();
    });
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.querySelector('.nav-icon-menu')?.classList.toggle('hidden', isOpen);
    menuToggle.querySelector('.nav-icon-close')?.classList.toggle('hidden', !isOpen);
  });

  const onScrollNav = () => {
    if (globalNav) {
      globalNav.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    updateActiveNavLink();
  };

  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
};

initNavigation();

// Listeners
window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', resizeCanvas);

// Initialize Page
preloadImages(() => {
  loader.classList.add('fade-out');
  
  setTimeout(() => {
    loader.style.display = 'none';
  }, 800);
  
  resizeCanvas();
  updateScrollState();
  
  requestAnimationFrame(animationLoop);
});
