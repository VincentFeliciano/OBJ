/* =========================================
   OBJ.52 — main2.js  (Gallery / index2)
   ========================================= */

gsap.registerPlugin(Observer);

/* ── DOM refs ─────────────────────────────── */
const canvas      = document.getElementById('galleryCanvas');
const col0El      = document.getElementById('col0');
const col1El      = document.getElementById('col1');
const detailView  = document.getElementById('detailView');
const detailClose = document.getElementById('detailClose');
const detailImage = document.getElementById('detailImage');
const detailText  = document.getElementById('detailText');
const menuBtn     = document.getElementById('menuBtn');

/* ── Config ───────────────────────────────── */
const AUTO_SPEED        = 0.075; /* px/tick upward drift                 */
const WHEEL_SENSITIVITY = 0.6;  /* wheel delta scale                     */
const DRAG_SENSITIVITY  = 0.8;  /* drag delta scale                      */
const FRICTION          = 0.90; /* velocity decay per tick (0–1)         */
const ITEM_GAP          = 72;   /* must match CSS gap px in .g-col       */

/* ── State ────────────────────────────────── */
let currentFilter = 'all';
let visiblePieces = [];

/* cols[0] → left (#col0), cols[1] → right (#col1)
   Each entry: { el, setH, yPos }
   setH = height of one original set + one gap (for seamless wrap math) */
let cols = [];

let vel            = 0;
let isHovered      = false;
let isDragging     = false;
let hasDragged     = false;
let menuOpen       = false;
let lastClickedItem= null; /* remembered for the close reverse animation */
let lastHeroColor  = '#E8E8E5'; /* edge-sampled color reused on close    */

/* ── SHUFFLE ──────────────────────────────── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── SAMPLE EDGE COLOR ────────────────────── */

/* Draws the already-loaded img element onto a small canvas and averages
   the four corner pixels to get the image's background/edge colour.
   Works on any HTTP server (incl. GitHub Pages). Falls back to off-white
   when run directly from the filesystem (file:// blocks canvas reads).  */
function sampleEdgeColor(imgEl) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, 64, 64);
    const corners = [
      ctx.getImageData(0,  0,  1, 1).data,
      ctx.getImageData(63, 0,  1, 1).data,
      ctx.getImageData(0,  63, 1, 1).data,
      ctx.getImageData(63, 63, 1, 1).data,
    ];
    const [r, g, b] = corners
      .reduce((a, px) => [a[0]+px[0], a[1]+px[1], a[2]+px[2]], [0,0,0])
      .map(v => Math.round(v / corners.length));
    return `rgb(${r},${g},${b})`;
  } catch {
    return '#E8E8E5';
  }
}

/* ── BUILD ITEM ───────────────────────────── */

function buildItem(piece) {
  const el = document.createElement('div');
  el.className = 'g-item';
  el.dataset.id = piece.id;
  el.innerHTML = `<img src="${piece.folder}/${piece.images[0]}" alt="${piece.name}" loading="lazy">`;
  return el;
}

/* ── RENDER ───────────────────────────────── */

function renderGallery(filter) {
  const pool = filter === 'all'
    ? PIECES
    : PIECES.filter(p => p.type === filter);

  visiblePieces = shuffle(pool);

  /* Tear down */
  col0El.innerHTML = '';
  col1El.innerHTML = '';
  cols = [];
  vel  = 0;

  if (visiblePieces.length === 0) {
    col0El.innerHTML = '<div style="font-size:11px;letter-spacing:0.1em;color:#aaa;padding:20px 0;">NO OBJECTS IN THIS CATEGORY</div>';
    return;
  }

  /* Split: even-indexed → col0 (left), odd-indexed → col1 (right).
     No piece ever appears in both columns.                          */
  const groups = [
    visiblePieces.filter((_, i) => i % 2 === 0),
    visiblePieces.filter((_, i) => i % 2 === 1),
  ];

  [col0El, col1El].forEach((colEl, ci) => {
    const pieces = groups[ci];
    if (!pieces || pieces.length === 0) return;

    /* Render originals with random spacing (100–250px, steps of 10) and random width */
    /* Width: 50% full, 30% medium, 20% small */
    const pickWidth = () => { const r = Math.random(); return r < 0.5 ? '100%' : r < 0.8 ? '75%' : '50%'; };
    const originals = pieces.map(p => {
      const item = buildItem(p);
      item.style.marginBottom = `${Math.floor(Math.random() * 16) * 10 + 100}px`;
      item.style.width = pickWidth();
      return item;
    });
    originals.forEach(item => colEl.appendChild(item));

    /* Keep a live reference to the first original item so the menu card
       can be inserted right before it (top of the visible set).
       velMult: per-column speed multiplier for parallax-like feel.    */
    const velMult = ci === 0 ? 1.0 : 0.6;
    const col = { el: colEl, setH: 0, yPos: 0, firstOriginal: originals[0], velMult };
    cols[ci] = col;

    /* Measure after one paint, then clone for seamless loop */
    requestAnimationFrame(() => {
      /* offsetHeight of one full set; add ITEM_GAP for the seam between sets */
      col.setH = colEl.offsetHeight + ITEM_GAP;

      /* Clone sets: [before] [originals] [after] */
      const before = document.createDocumentFragment();
      const after  = document.createDocumentFragment();
      originals.forEach(item => {
        before.appendChild(item.cloneNode(true));
        after.appendChild(item.cloneNode(true));
      });
      colEl.prepend(before);
      colEl.appendChild(after);

      /* Start positioned at the middle (original) set */
      col.yPos = -col.setH;
      gsap.set(colEl, { y: col.yPos });
    });
  });
}

/* ── GSAP TICKER ──────────────────────────── */

gsap.ticker.lagSmoothing(0);

gsap.ticker.add(() => {
  if (!cols.length) return;

  if (!isHovered && !isDragging) vel -= AUTO_SPEED;
  vel *= FRICTION;

  cols.forEach(col => {
    if (!col || col.setH === 0) return;

    col.yPos += vel * col.velMult;

    /* Seamless bidirectional wrap */
    if (col.yPos < -col.setH * 2) col.yPos += col.setH;
    if (col.yPos > 0)              col.yPos -= col.setH;

    gsap.set(col.el, { y: col.yPos, force3D: true });
  });
});

/* ── WHEEL ────────────────────────────────── */

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  vel -= e.deltaY * WHEEL_SENSITIVITY;
}, { passive: false });

/* ── DRAG via GSAP Observer ───────────────── */

Observer.create({
  target: canvas,
  type: 'pointer',
  preventDefault: false,

  onPress: () => {
    isDragging = true;
    hasDragged = false;
    canvas.style.cursor = 'grabbing';
  },

  onDrag: (self) => {
    if (Math.abs(self.deltaX) + Math.abs(self.deltaY) > 2) hasDragged = true;
    vel += self.deltaY * DRAG_SENSITIVITY;
  },

  onRelease: () => {
    isDragging = false;
    canvas.style.cursor = '';
  },

  /* onHoverEnd fires when the mouse leaves the canvas entirely (window edge) */
  onHoverEnd: () => { isHovered = false; },
});

/* Auto-scroll pauses only while the mouse is over a column, not the
   whole canvas. mouseenter/mouseleave on each column handle this.     */
[col0El, col1El].forEach(colEl => {
  colEl.addEventListener('mouseenter', () => { isHovered = true;  });
  colEl.addEventListener('mouseleave', () => { isHovered = false; });
});

/* ── CLICK → open detail ──────────────────── */

canvas.addEventListener('click', (e) => {
  if (hasDragged) { hasDragged = false; return; }
  const item = e.target.closest('.g-item');
  if (!item || item.classList.contains('menu-card')) return;
  const piece = PIECES.find(p => p.id === item.dataset.id);
  if (piece) openDetail(piece, item);
});

/* ── CART ─────────────────────────────────── */

function getCart() {
  try { return JSON.parse(localStorage.getItem('obj52_cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('obj52_cart', JSON.stringify(cart));
}
function isInCart(id) {
  return getCart().some(i => i.id === id);
}
function addToCart(piece) {
  const cart = getCart();
  if (!isInCart(piece.id)) {
    cart.push({ id: piece.id, designation: piece.designation, name: piece.name, price: piece.price });
    saveCart(cart);
  }
  updateCartBadge();
}
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateCartBadge();
}
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const n = getCart().length;
  badge.textContent = n;
  badge.classList.toggle('hidden', n === 0);
}
function renderCartPanel() {
  const list = document.getElementById('cartItemsList');
  const countLine = document.getElementById('cartCountLine');
  if (!list) return;
  const cart = getCart();
  if (countLine) countLine.textContent = `${cart.length} ITEM${cart.length !== 1 ? 'S' : ''}`;
  if (!cart.length) {
    list.innerHTML = '<p class="cart-empty-msg">Your cart is empty.</p>';
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-desig">${item.designation}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">REMOVE</button>
    </div>
  `).join('');
  list.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => { removeFromCart(btn.dataset.id); renderCartPanel(); });
  });
}
function openCart() {
  const panel = document.getElementById('cartPanel');
  if (panel) { panel.classList.add('open'); renderCartPanel(); }
}
function closeCart() {
  const panel = document.getElementById('cartPanel');
  if (panel) panel.classList.remove('open');
}
function initCart() {
  /* Cart button in top nav */
  const btn = document.createElement('button');
  btn.className = 'g2-cart-btn';
  btn.id = 'cartBtn';
  btn.innerHTML = `CART <span class="cart-badge hidden" id="cartBadge">0</span>`;
  btn.addEventListener('click', openCart);
  document.querySelector('.g2-topcorner').prepend(btn);

  /* Cart panel */
  const panel = document.createElement('div');
  panel.className = 'cart-panel';
  panel.id = 'cartPanel';
  const inquiryItems = () => getCart().map(i => i.name).join(', ');
  panel.innerHTML = `
    <div class="cart-panel-header">
      <span class="cart-panel-title">CART</span>
      <button class="cart-panel-close" id="cartPanelClose">CLOSE ×</button>
    </div>
    <div class="cart-items-list" id="cartItemsList"></div>
    <div class="cart-panel-footer">
      <div class="cart-count-line" id="cartCountLine"></div>
      <a class="cart-checkout-btn" id="cartInquireAll" href="#">CHECKOUT</a>
    </div>
  `;
  document.body.appendChild(panel);
  document.getElementById('cartPanelClose').addEventListener('click', closeCart);

  /* Dynamically build the mailto href when clicked */
  document.getElementById('cartInquireAll').addEventListener('click', (e) => {
    const items = getCart();
    if (!items.length) { e.preventDefault(); return; }
    const subject = encodeURIComponent(`Cart Inquiry — ${items.map(i => i.designation).join(', ')}`);
    const body    = encodeURIComponent(`I'm interested in the following pieces:\n\n${items.map(i => `${i.designation}: ${i.name} — ${i.price}`).join('\n')}`);
    window.location.href = `mailto:hello@obj52.com?subject=${subject}&body=${body}`;
  });

  updateCartBadge();
}

/* ── LOCAL STORAGE ────────────────────────── */

function getViews(id) {
  return parseInt(localStorage.getItem(`obj52_views_${id}`) || '0');
}
function incrementViews(id) {
  const n = getViews(id) + 1;
  localStorage.setItem(`obj52_views_${id}`, n);
  return n;
}
function getComments(id) {
  try { return JSON.parse(localStorage.getItem(`obj52_comments_${id}`) || '[]'); }
  catch { return []; }
}
function saveComment(id, name, text) {
  const list = getComments(id);
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  list.push({ name: name.trim(), text: text.trim(), date });
  localStorage.setItem(`obj52_comments_${id}`, JSON.stringify(list));
  return list;
}
function renderComments(id, listEl) {
  const comments = getComments(id);
  if (!comments.length) {
    listEl.innerHTML = '<p class="dt-no-comments">No notes yet. Be the first.</p>';
    return;
  }
  listEl.innerHTML = comments.map(c => `
    <div class="dt-comment-item">
      <div class="dt-comment-meta">
        <span class="dt-comment-name">${c.name.toUpperCase()}</span>
        <span class="dt-comment-date">${c.date}</span>
      </div>
      <p class="dt-comment-text">${c.text}</p>
    </div>
  `).join('');
}

/* ── DETAIL VIEW ──────────────────────────── */

function openDetail(piece, clickedItem) {
  lastClickedItem = clickedItem;

  /* Image panel */
  detailImage.innerHTML = `<img src="${piece.folder}/${piece.images[0]}" alt="${piece.name}" id="detailMainImg">`;

  /* Thumbnails (only when multiple images) */
  const thumbsHTML = piece.images.length > 1
    ? `<div class="dt-thumbs">
        ${piece.images.map((img, i) => `
          <div class="dt-thumb ${i === 0 ? 'active' : ''}" data-src="${piece.folder}/${img}">
            <img src="${piece.folder}/${img}" alt="${piece.name} ${i + 1}">
          </div>
        `).join('')}
      </div>`
    : '';

  const ctaTxt  = piece.status === 'COMMISSIONED' ? 'COMMISSION A SIMILAR PIECE' :
                  piece.status === 'ARCHIVED'     ? 'INQUIRE ABOUT SIMILAR'      : 'INQUIRE ABOUT THIS PIECE';
  const subject = encodeURIComponent(`Inquiry — ${piece.designation}: ${piece.name}`);

  const preservedHTML = piece.preserved.map(p => `<li>${p}</li>`).join('');
  const rebuiltHTML   = piece.rebuilt.map(r => `<li>${r}</li>`).join('');
  const historyHTML   = piece.objectHistory.map(h =>
    `<div class="dt-timeline-row"><span class="dt-year">${h.year}</span><span class="dt-event">${h.event}</span></div>`
  ).join('');

  const viewCount  = incrementViews(piece.id);
  const inCart     = isInCart(piece.id);

  detailText.innerHTML = `
    <!-- ── Pinned top: name + subtitle + thumbnails ── -->
    <div class="dt-pinned-top">
      <div class="dt-name">${piece.name}</div>
      <div class="dt-subtitle">${piece.subtitle}</div>
      ${thumbsHTML}
    </div>

    <!-- ── Scrollable middle: all detail content ── -->
    <div class="dt-body-scroll">
      <div class="dt-label">THE STORY</div>
      <p class="dt-body">${piece.story}</p>

      <div class="dt-label">THE RESTORATION</div>
      <p class="dt-body">${piece.restorationDesc}</p>

      <div class="dt-label">PRESERVED</div>
      <ul class="dt-list">${preservedHTML}</ul>

      <div class="dt-label">REBUILT</div>
      <ul class="dt-list">${rebuiltHTML}</ul>

      <div class="dt-label">MATERIALS</div>
      <p class="dt-value">${piece.materials.join(', ')}</p>

      <div class="dt-label">DIMENSIONS</div>
      <p class="dt-value">${piece.dimensions}</p>

      <div class="dt-label">ERA</div>
      <p class="dt-value">${piece.era}</p>

      <div class="dt-label">FOUND</div>
      <p class="dt-value">${piece.found}</p>

      <div class="dt-label">EDITION</div>
      <p class="dt-value">${piece.edition}</p>

      <div class="dt-label">RESTORATION TIME</div>
      <p class="dt-value">${piece.restorationTime}</p>

      <div class="dt-label">OBJECT HISTORY</div>
      <div>${historyHTML}</div>

      <div class="dt-label">MAKER'S NOTE</div>
      <p class="dt-body" style="font-style:italic">${piece.makersNote}</p>

      <div class="dt-comments-header">
        <span class="dt-label" style="margin:0">ARCHIVE NOTES</span>
        <span class="dt-views">${viewCount} VIEW${viewCount !== 1 ? 'S' : ''}</span>
      </div>
      <div id="dtCommentsList"></div>
      <form class="dt-comment-form" id="dtCommentForm">
        <input class="dt-input" type="text" name="name" placeholder="Your name" maxlength="60" required>
        <textarea class="dt-textarea" name="text" placeholder="Leave a note about this piece…" maxlength="500" required></textarea>
        <button class="dt-submit" type="submit">LEAVE A NOTE</button>
      </form>
    </div>

    <!-- ── Pinned bottom: price + actions ── -->
    <div class="dt-pinned-bot">
      <div class="dt-price">${piece.price}</div>
      <a class="dt-cta" href="mailto:hello@obj52.com?subject=${subject}">${ctaTxt}</a>
      <button class="dt-add-cart ${piece.status === 'SOLD' ? 'sold-out' : inCart ? 'in-cart' : ''}" id="dtAddCart"
        ${piece.status === 'SOLD' ? 'disabled' : ''}>
        ${piece.status === 'SOLD' ? 'SOLD OUT' : inCart ? 'IN CART' : 'ADD TO CART'}
      </button>
    </div>
  `;

  /* Add to cart — only if not sold */
  const addCartBtn = document.getElementById('dtAddCart');
  if (addCartBtn && piece.status !== 'SOLD') {
    addCartBtn.addEventListener('click', () => {
      addToCart(piece);
      addCartBtn.textContent = 'IN CART';
      addCartBtn.classList.add('in-cart');
    });
  }

  /* Thumbnail switcher */
  const mainImg = document.getElementById('detailMainImg');
  detailText.querySelectorAll('.dt-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      detailText.querySelectorAll('.dt-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      gsap.to(mainImg, { opacity: 0, duration: 0.15, onComplete: () => {
        mainImg.src = thumb.dataset.src;
        gsap.to(mainImg, { opacity: 1, duration: 0.2 });
      }});
    });
  });

  /* Comments */
  const commentsList = document.getElementById('dtCommentsList');
  renderComments(piece.id, commentsList);

  const commentForm = document.getElementById('dtCommentForm');
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = commentForm.querySelector('[name="name"]').value;
    const text = commentForm.querySelector('[name="text"]').value;
    if (name && text) {
      saveComment(piece.id, name, text);
      renderComments(piece.id, commentsList);
      commentForm.reset();
    }
  });

  /* ── Hero open animation ─────────────────────────────────────────
     1. Show detailView immediately (bypass CSS fade) with panels hidden.
     2. Measure detailImage's final rect in a rAF (after layout).
     3. Animate a hero div from the clicked item's position to that rect.
     4. On complete: remove hero, reveal panels.                        */
  document.body.style.overflow = 'hidden';
  detailView.style.transition  = 'none';
  detailView.style.opacity     = '1';
  detailView.style.pointerEvents = 'all';
  gsap.set(detailImage, { opacity: 0 });
  gsap.set(detailText,  { opacity: 0 });

  requestAnimationFrame(() => {
    /* Restore CSS transition for future use */
    detailView.style.transition    = '';
    detailView.style.opacity       = '';
    detailView.style.pointerEvents = '';
    detailView.classList.add('open');

    const fromRect = clickedItem.getBoundingClientRect();
    const toRect   = detailImage.getBoundingClientRect();

    /* Sample the edge colour of the clicked image and store for close */
    lastHeroColor = sampleEdgeColor(clickedItem.querySelector('img'));

    /* Hero: a fixed clone that travels from the card to the image panel.
       Phase 1 — image moves and grows to fit the content area (inside padding).
       Phase 2 — border expands outward in the image's own edge colour.         */
    const PAD = 60;
    const innerLeft   = toRect.left   + PAD;
    const innerTop    = toRect.top    + PAD;
    const innerWidth  = toRect.width  - PAD * 2;
    const innerHeight = toRect.height - PAD * 2;

    const hero = document.createElement('div');
    hero.style.cssText = `position:fixed;left:${fromRect.left}px;top:${fromRect.top}px;`
      + `width:${fromRect.width}px;height:${fromRect.height}px;`
      + `overflow:hidden;z-index:300;background:transparent;pointer-events:none;`;
    const heroImg = document.createElement('img');
    heroImg.src = clickedItem.querySelector('img').src;
    heroImg.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;padding:0px;';
    hero.appendChild(heroImg);
    document.body.appendChild(hero);

    const tl = gsap.timeline({
      onComplete: () => {
        hero.remove();
        detailImage.style.background = lastHeroColor;
        gsap.set(detailImage, { opacity: 1 });
        gsap.to(detailText, { opacity: 1, duration: 0.25 });
      },
    });
    /* Phase 1: image travels to content area (no border yet) */
    tl.to(hero, { left: innerLeft, top: innerTop, width: innerWidth, height: innerHeight, duration: 0.45, ease: 'power2.inOut' }, 0);
    /* Phase 2: border expands outward in the image's sampled edge colour */
    tl.to(hero,    { left: toRect.left, top: toRect.top, width: toRect.width, height: toRect.height, backgroundColor: lastHeroColor, duration: 0.3, ease: 'power2.out' }, 0.45)
      .to(heroImg, { padding: PAD, duration: 0.3, ease: 'power2.out' }, 0.45);
  });
}

function closeDetail() {
  /* ── Hero close animation ────────────────────────────────────────
     Mirror of open: hero starts at detailImage's position and shrinks
     back to the original clicked item.                              */
  const fromRect = detailImage.getBoundingClientRect();
  const mainImg  = document.getElementById('detailMainImg');

  /* Close is the reverse two-phase sequence:
     Phase 1 — grey border collapses inward, leaving just the image.
     Phase 2 — image shrinks back to the original card position.     */
  const PAD = 60;
  const innerLeft   = fromRect.left   + PAD;
  const innerTop    = fromRect.top    + PAD;
  const innerWidth  = fromRect.width  - PAD * 2;
  const innerHeight = fromRect.height - PAD * 2;

  const hero = document.createElement('div');
  hero.style.cssText = `position:fixed;left:${fromRect.left}px;top:${fromRect.top}px;`
    + `width:${fromRect.width}px;height:${fromRect.height}px;`
    + `overflow:hidden;z-index:300;background:${lastHeroColor};pointer-events:none;`;
  const heroImg = document.createElement('img');
  heroImg.src = mainImg ? mainImg.src : '';
  heroImg.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:60px;display:block;';
  hero.appendChild(heroImg);
  document.body.appendChild(hero);

  /* Fade out text, hide detail view immediately */
  gsap.to(detailText, { opacity: 0, duration: 0.18 });
  detailView.style.transition    = 'none';
  detailView.style.opacity       = '0';
  detailView.style.pointerEvents = 'none';
  detailView.classList.remove('open');
  document.body.style.overflow   = '';

  requestAnimationFrame(() => {
    detailView.style.transition    = '';
    detailView.style.opacity       = '';
    detailView.style.pointerEvents = '';
  });

  if (lastClickedItem) {
    const toRect = lastClickedItem.getBoundingClientRect();
    const tl = gsap.timeline({
      onComplete: () => { hero.remove(); },
    });
    /* Phase 1: grey border collapses inward */
    tl.to(hero,    { left: innerLeft, top: innerTop, width: innerWidth, height: innerHeight, backgroundColor: 'transparent', duration: 0.25, ease: 'power2.in' }, 0)
      .to(heroImg, { padding: 0, duration: 0.25, ease: 'power2.in' }, 0);
    /* Phase 2: image travels back to card */
    tl.to(hero, { left: toRect.left, top: toRect.top, width: toRect.width, height: toRect.height, duration: 0.4, ease: 'power2.inOut' }, 0.25);
  } else {
    gsap.to(hero, { opacity: 0, duration: 0.3,
      onComplete: () => { hero.remove(); },
    });
  }
}

detailClose.addEventListener('click', closeDetail);
detailView.addEventListener('click', e => { if (e.target === detailView) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

/* ── MENU CARD ────────────────────────────── */

function openMenu() {
  menuOpen = true;
  isHovered = true; /* pause auto-scroll while menu is open */
  if (document.getElementById('menuCard')) return;

  /* Use col1 if it exists, otherwise col0 */
  const col = cols[1] || cols[0];
  if (!col) return;

  const card = document.createElement('div');
  card.className = 'g-item menu-card';
  card.id = 'menuCard';
  const filters = ['ALL', 'FOUND', 'RESTORED', 'REFORMATTED', 'CUSTOM'];

  card.innerHTML = `
    <div class="menu-card-inner">
      <div class="menu-card-top">
        <span class="menu-card-label">OBJ.52</span>
        <button class="menu-card-close" id="menuCardClose">CLOSE</button>
      </div>
      <div class="menu-card-section-label">FILTER</div>
      <nav class="menu-card-filters">
        ${filters.map(f => {
          const val = f === 'ALL' ? 'all' : f;
          return `<button class="menu-filter-btn ${currentFilter === val ? 'active' : ''}" data-filter="${val}">${f}</button>`;
        }).join('')}
      </nav>
      <div class="menu-card-divider"></div>
      <nav class="menu-card-nav">
        <a href="restore.html">RESTORATION REQUEST</a>
        <a href="mailto:hello@obj52.com">CONTACT</a>
      </nav>
      <div class="menu-card-footer">OBJECTS / RESTORATION / DESIGN</div>
    </div>
  `;

  /* Insert right before the first original item so it scrolls with the column */
  col.el.insertBefore(card, col.firstOriginal);
  document.getElementById('menuCardClose').addEventListener('click', closeMenu);

  /* Filter buttons inside menu */
  card.querySelectorAll('.menu-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      closeMenu();
      renderGallery(currentFilter);
    });
  });

  /* Center the card vertically in the viewport */
  requestAnimationFrame(() => {
    const offset = Math.max(0, (window.innerHeight - card.offsetHeight) / 2);
    col.yPos = -col.setH + offset;
    gsap.set(col.el, { y: col.yPos });
  });
}

function closeMenu() {
  menuOpen = false;
  isHovered = false; /* resume auto-scroll */
  const card = document.getElementById('menuCard');
  if (card) card.remove();
}

menuBtn.addEventListener('click', () => { menuOpen ? closeMenu() : openMenu(); });

/* ── INIT ─────────────────────────────────── */

initCart();
renderGallery('all');
