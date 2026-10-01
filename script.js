const clock = document.querySelector('#local-time');
const formatTime = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
function updateClock() {
  const now = new Date();
  clock.textContent = formatTime.format(now);
  clock.dateTime = now.toISOString();
  document.querySelector('#year').textContent = now.getFullYear();
}
updateClock();
setInterval(updateClock, 30_000);

const copyButton = document.querySelector('.copy-email');
if (copyButton?.dataset.email && copyButton.querySelector('span') && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  let resetCopy;
  copyButton.addEventListener('click', async () => {
    const label = copyButton.querySelector('span');
    try {
      await navigator.clipboard.writeText(copyButton.dataset.email);
      label.textContent = 'Indirizzo copiato!';
      document.querySelector('#copy-status').textContent = 'Indirizzo email copiato negli appunti.';
    } catch {
      label.textContent = copyButton.dataset.email;
      document.querySelector('#copy-status').textContent = 'Copia non disponibile. Puoi selezionare l’indirizzo o usare il link email.';
    }
    clearTimeout(resetCopy);
    resetCopy = setTimeout(() => { label.textContent = 'Copia indirizzo email'; }, 3500);
  });
}

const motionDialog = document.querySelector('#motion-dialog');
const motionButton = document.querySelector('#motion-open');
const dialogTitle = document.querySelector('#motion-title');
const dialogImage = document.querySelector('#gallery-image');
const galleryCards = [...document.querySelectorAll('.shelf .paper')];
const galleryPosition = motionDialog?.querySelector('.gallery-position');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentIndex = 0;
let activePreview = null;
let outgoingImage = null;

// Reserve the complete text width while revealing one character at a time.
// The accessible name stays complete throughout the visual animation.
function setTypewriterText(element, text) {
  const fragment = document.createDocumentFragment();
  let index = 0;
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      fragment.append(document.createTextNode(part));
      index += part.length;
      continue;
    }
    const word = document.createElement('span');
    word.className = 'typewriter-word';
    for (const character of part) {
      const span = document.createElement('span');
      span.className = 'typewriter-char';
      span.style.setProperty('--char-index', index++);
      span.textContent = character;
      word.append(span);
    }
    fragment.append(word);
  }
  element.replaceChildren(fragment);
}

document.querySelectorAll('.photo-label').forEach(label => {
  setTypewriterText(label, label.textContent);
});

function renderPostcard(card) {
  const image = card.querySelector('img');
  const caption = card.querySelector('.photo-label').textContent;
  dialogTitle.setAttribute('aria-label', caption);
  setTypewriterText(dialogTitle, caption);
  for (const word of dialogTitle.children) word.setAttribute('aria-hidden', 'true');
  dialogImage.alt = image.alt;
  dialogImage.src = image.src;
  dialogImage.removeAttribute('width');
  dialogImage.removeAttribute('height');
  galleryPosition.textContent = `${currentIndex + 1} / ${galleryCards.length}`;

  // Show the already loaded thumbnail immediately, then its larger web copy.
  const preview = new Image();
  activePreview = preview;
  if (card.dataset.fullSrc) {
    preview.onload = () => {
      if (motionDialog.open && activePreview === preview) dialogImage.src = preview.src;
    };
    preview.src = card.dataset.fullSrc;
  }
}

function stopSlideAnimation() {
  activePreview = null;
  dialogImage.getAnimations().forEach(animation => animation.cancel());
  if (outgoingImage) {
    outgoingImage.getAnimations().forEach(animation => animation.cancel());
    outgoingImage.remove();
    outgoingImage = null;
  }
}

function openPostcard(card) {
  stopSlideAnimation();
  currentIndex = galleryCards.indexOf(card);
  motionDialog.showModal();
  renderPostcard(card);
}

async function navigatePostcard(direction) {
  if (!motionDialog.open) return;
  stopSlideAnimation();
  currentIndex = (currentIndex + direction + galleryCards.length) % galleryCards.length;
  const card = galleryCards[currentIndex];
  if (reducedMotion.matches) {
    renderPostcard(card);
    return;
  }
  // Keep both images fully opaque while they slide side by side.
  const previousImage = dialogImage.cloneNode(false);
  previousImage.removeAttribute('id');
  previousImage.alt = '';
  previousImage.setAttribute('aria-hidden', 'true');
  previousImage.className = 'gallery-outgoing';
  dialogImage.parentElement.append(previousImage);
  outgoingImage = previousImage;
  renderPostcard(card);
  const timing = { duration: 360, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' };
  const outgoing = previousImage.animate([
    { transform: 'translateX(0)' },
    { transform: `translateX(${-direction * 100}%)` }
  ], timing);
  const incoming = dialogImage.animate([
    { transform: `translateX(${direction * 100}%)` },
    { transform: 'translateX(0)' }
  ], timing);
  await Promise.allSettled([outgoing.finished, incoming.finished]);
  outgoing.cancel();
  incoming.cancel();
  previousImage.remove();
  if (outgoingImage === previousImage) outgoingImage = null;
}

if (motionDialog && motionButton && typeof motionDialog.showModal === 'function') {
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => openPostcard(motionButton));
  document.querySelectorAll('.paper-photo').forEach(card => {
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', event => {
      event.preventDefault();
      openPostcard(card);
    });
  });
  document.querySelector('#motion-close').addEventListener('click', () => motionDialog.close());
  motionDialog.addEventListener('close', stopSlideAnimation);
  motionDialog.querySelector('.gallery-prev').addEventListener('click', () => navigatePostcard(-1));
  motionDialog.querySelector('.gallery-next').addEventListener('click', () => navigatePostcard(1));
  motionDialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigatePostcard(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  motionDialog.addEventListener('click', event => {
    if (event.target !== motionDialog) return;
    const rect = motionDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) motionDialog.close();
  });
}

// Horizontal touch gestures are enabled only on the mobile gallery.
if (motionDialog) {
  const stage = motionDialog.querySelector('.gallery-stage');
  const mobileSwipe = window.matchMedia('(max-width:700px) and (pointer:coarse)');
  let gesture = null;
  stage.addEventListener('pointerdown', event => {
    if (!mobileSwipe.matches || event.pointerType !== 'touch' || !motionDialog.open) return;
    if (!event.isPrimary) { gesture = null; return; }
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) gesture = null;
  });
  stage.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    gesture = null;
    if (mobileSwipe.matches && motionDialog.open && Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5) navigatePostcard(dx < 0 ? 1 : -1);
  });
  for (const type of ['pointercancel', 'lostpointercapture']) stage.addEventListener(type, () => { gesture = null; });
  motionDialog.addEventListener('close', () => { gesture = null; });
  mobileSwipe.addEventListener('change', () => { gesture = null; });
}

// One shared preview follows the active project; image loads cannot revive stale hovers.
const previewLinks = [...document.querySelectorAll('a[data-preview]')];
if (previewLinks.length) {
  const portfolio = document.querySelector('.portfolio');
  const hoverDevice = window.matchMedia('(hover:hover) and (pointer:fine)');
  const preview = document.createElement('div');
  preview.className = 'project-preview';
  preview.hidden = true;
  preview.setAttribute('aria-hidden', 'true');
  document.body.append(preview);
  let activeLink = null, activeImage = null, loadVersion = 0, hideTimer, moveFrame;
  let lastY = null, direction = 1, targetY = 0;
  const imageCache = new Map();
  const space = () => {
    const main = portfolio.getBoundingClientRect();
    const width = parseFloat(getComputedStyle(preview).width);
    const gap = parseFloat(getComputedStyle(portfolio).paddingLeft);
    return { left: main.left - gap - width, gap, height: width * 5 / 8 };
  };
  const enabled = () => hoverDevice.matches && !reducedMotion.matches && space().left >= space().gap;
  const position = y => {
    const bounds = space();
    preview.style.left = `${bounds.left}px`;
    preview.style.top = `${Math.max(bounds.gap, Math.min(y - bounds.height / 2, innerHeight - bounds.height - bounds.gap))}px`;
  };
  const hide = () => {
    clearTimeout(hideTimer);
    activeLink = null;
    loadVersion++;
    preview.dataset.visible = 'false';
    preview.style.setProperty('--preview-entry', `${direction * -16}px`);
  };
  const reset = () => { hide(); preview.hidden = true; };
  const getImage = src => {
    if (!imageCache.has(src)) {
      const image = new Image();
      image.alt = ''; image.draggable = false; image.decoding = 'async';
      image.src = src;
      imageCache.set(src, image.decode().then(() => {
        image.width = image.naturalWidth; image.height = image.naturalHeight;
        return image;
      }).catch(error => { imageCache.delete(src); throw error; }));
    }
    return imageCache.get(src);
  };
  // Reuse the HTML preloads and decode each unique asset once, before the first hover.
  for (const src of new Set(previewLinks.map(link => link.dataset.preview))) getImage(src).catch(() => {});
  async function show(link, y) {
    if (!enabled()) { reset(); return; }
    clearTimeout(hideTimer);
    activeLink = link;
    targetY = y;
    const version = ++loadVersion;
    try {
      const loaded = await getImage(link.dataset.preview);
      if (version !== loadVersion || activeLink !== link || !enabled()) return;
      const wasVisible = preview.dataset.visible === 'true';
      preview.hidden = false;
      position(targetY);
      preview.style.setProperty('--preview-entry', `${direction * -16}px`);
      if (!activeImage || activeImage.src !== loaded.src) {
        activeImage?.getAnimations().forEach(animation => animation.cancel());
        loaded.getAnimations().forEach(animation => animation.cancel());
        preview.replaceChildren(loaded);
        activeImage = loaded;
        if (wasVisible) loaded.animate([
          { opacity: 0, transform: `translateY(${direction * -16}px)` },
          { opacity: 1, transform: 'none' }
        ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
      // Commit the entry state before fading/sliding into place.
      if (!wasVisible) void preview.offsetWidth;
      preview.dataset.visible = 'true';
    } catch { if (version === loadVersion) reset(); }
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    if (lastY !== null && Math.abs(event.clientY - lastY) > 1) direction = event.clientY > lastY ? 1 : -1;
    lastY = event.clientY;
    if (!activeLink) return;
    targetY = event.clientY;
    if (!moveFrame) moveFrame = requestAnimationFrame(() => { position(targetY); moveFrame = 0; });
  }, { passive: true });
  for (const link of previewLinks) {
    const target = link;
    target.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') show(link, event.clientY); });
    target.addEventListener('pointerleave', () => { hideTimer = setTimeout(hide, 80); });
    link.addEventListener('focus', () => { const r = link.getBoundingClientRect(); show(link, r.top + r.height / 2); });
    link.addEventListener('blur', hide);
    link.addEventListener('click', hide);
  }
  window.addEventListener('resize', reset);
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('blur', hide);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  document.querySelectorAll('.folder').forEach(folder => folder.addEventListener('toggle', hide));
  hoverDevice.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
}

// Animate measured heights, including closing, without experimental details CSS.
for (const accordion of document.querySelectorAll('details.folder, details.experience')) {
  const summary = accordion.querySelector('summary');
  let animation = null;
  let expanded = accordion.open;
  const finish = () => {
    animation?.cancel();
    animation = null;
    accordion.open = expanded;
    accordion.classList.remove('is-animating');
    delete accordion.dataset.expanded;
    summary.removeAttribute('aria-expanded');
  };
  summary.addEventListener('click', event => {
    event.preventDefault();
    const from = accordion.getBoundingClientRect().height;
    expanded = animation ? !expanded : !accordion.open;
    animation?.cancel();
    animation = null;
    accordion.dataset.expanded = String(expanded);
    summary.setAttribute('aria-expanded', String(expanded));
    accordion.dispatchEvent(new Event('accordionchange'));
    if (reducedMotion.matches || !accordion.animate) { finish(); return; }
    // Measure both natural endpoints before keeping the content open to animate.
    accordion.open = expanded;
    const to = accordion.getBoundingClientRect().height;
    accordion.open = true;
    accordion.classList.add('is-animating');
    animation = accordion.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: 500,
      easing: getComputedStyle(document.documentElement).getPropertyValue('--ease').trim()
    });
    animation.onfinish = finish;
  });
  window.addEventListener('resize', () => { if (animation) finish(); });
  reducedMotion.addEventListener('change', () => { if (animation && reducedMotion.matches) finish(); });
}

// Animate the +/× as vector geometry, never as a rotated text bitmap.
for (const accordion of document.querySelectorAll('details.experience')) {
  const path = accordion.querySelector('.plus path');
  if (!path) continue;
  let progress = accordion.open ? 1 : 0;
  let frame = 0;
  const draw = () => {
    // Rotate endpoints on a circle: each stroke stays 10px long throughout.
    const angle = progress * Math.PI / 4;
    const x = 5 * Math.cos(angle), y = 5 * Math.sin(angle);
    // Anchor the painted right edge, including half the 2px stroke, at x=16.
    const centerX = 16 - x - Math.sin(angle);
    const p = [centerX-x, 8-y, centerX+x, 8+y, centerX+y, 8-x, centerX-y, 8+x].map(value => +value.toFixed(3));
    path.setAttribute('d', `M${p[0]} ${p[1]}L${p[2]} ${p[3]}M${p[4]} ${p[5]}L${p[6]} ${p[7]}`);
  };
  const update = () => {
    cancelAnimationFrame(frame);
    const target = (accordion.dataset.expanded ?? String(accordion.open)) === 'true' ? 1 : 0;
    if (reducedMotion.matches) { progress = target; draw(); return; }
    const from = progress, start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / 350);
      progress = from + (target - from) * (1 - Math.pow(1 - t, 3));
      draw();
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };
  draw();
  accordion.addEventListener('toggle', update);
  accordion.addEventListener('accordionchange', update);
  reducedMotion.addEventListener('change', update);
}
