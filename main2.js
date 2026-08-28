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
let currentPiece   = null; /* piece currently open in detail view        */
let lbIndex        = 0;    /* current lightbox image index               */

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

  /* On mobile use a single column; on desktop split even→col0, odd→col1 */
  const isMobile = window.innerWidth <= 767;
  const groups = isMobile
    ? [visiblePieces, []]
    : [
        visiblePieces.filter((_, i) => i % 2 === 0),
        visiblePieces.filter((_, i) => i % 2 === 1),
      ];

  [col0El, col1El].forEach((colEl, ci) => {
    const pieces = groups[ci];
    if (!pieces || pieces.length === 0) return;

    /* Width: 50% full, 30% medium, 20% small (desktop only — mobile always 100%) */
    const pickWidth = () => {
      if (isMobile) return '100%';
      const r = Math.random();
      return r < 0.5 ? '100%' : r < 0.8 ? '75%' : '50%';
    };
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

  /* Route checkout to contact page with cart items pre-filled */
  document.getElementById('cartInquireAll').addEventListener('click', (e) => {
    e.preventDefault();
    const items = getCart();
    if (!items.length) return;
    const params = new URLSearchParams({
      subject:     `Cart Inquiry — ${items.map(i => i.designation).join(', ')}`,
      name:        items.map(i => i.name).join(', '),
      designation: items.map(i => `${i.designation}: ${i.name} — ${i.price}`).join('\n'),
    });
    window.location.href = `contact.html?${params.toString()}`;
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
  currentPiece    = piece;
  /* Hide card immediately on click so it's never visible during open or close */
  if (clickedItem) clickedItem.style.opacity = '0';

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
  const contactParams = new URLSearchParams({
    subject:     `Inquiry — ${piece.designation}: ${piece.name}`,
    name:        piece.name,
    designation: piece.designation,
  });
  const contactHref = `contact.html?${contactParams.toString()}`;

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
      <a class="dt-cta" href="${contactHref}">${ctaTxt}</a>
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

        /* Expand button — tap/click to open fullscreen lightbox */
        const expandBtn = document.createElement('button');
        expandBtn.className = 'lb-open-btn';
        expandBtn.textContent = '⤢ VIEW';
        expandBtn.addEventListener('click', () => openLightbox(0));
        detailImage.appendChild(expandBtn);
        detailImage.style.cursor = 'zoom-in';
        detailImage.addEventListener('click', () => openLightbox(0));
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

  /* Clean up expand button and cursor */
  const expandBtn = detailImage.querySelector('.lb-open-btn');
  if (expandBtn) expandBtn.remove();
  detailImage.style.cursor = '';

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
      onComplete: () => {
        hero.remove();
        lastClickedItem.style.opacity = '';
      },
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
  const filters = ['ALL', 'FOUND', 'RESTORED', 'REFORMATTED'];

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
        <button class="menu-about-btn" id="menuAboutBtn">ABOUT</button>
        <a href="restore.html">RESTORATION REQUEST</a>
        <a href="contact.html">CONTACT</a>
      </nav>
      <div class="social-icons">
        <a href="#" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a href="#" aria-label="TikTok">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
          </svg>
        </a>
        <a href="#" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
          </svg>
        </a>
      </div>
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

  /* About button inside menu */
  document.getElementById('menuAboutBtn').addEventListener('click', () => {
    closeMenu();
    openAbout();
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

/* ── ABOUT PANEL ──────────────────────────── */

function initAbout() {
  const panel = document.createElement('div');
  panel.className = 'about-panel';
  panel.id = 'aboutPanel';
  panel.innerHTML = `
    <div class="about-panel-header">
      <span class="about-panel-title">ABOUT</span>
      <button class="about-panel-close" id="aboutPanelClose">CLOSE ×</button>
    </div>
    <div class="about-panel-body">
      <div class="about-eyebrow">OBJ.52 — SARATOGA SPRINGS, NY</div>
      <h2 class="about-headline">A restoration<br>and design<br>studio.</h2>

      <div class="about-body">
        <p>
          OBJ.52 is the work of a single person who has spent years learning how to make things —
          and how to bring things back.
        </p>
        <p>
          The studio finds objects that have been forgotten. Furniture from estate sales, workshops,
          and private collections. Things built with care that ended up in the wrong place.
          Each piece is assessed, documented, and restored — not to look new, but to look like
          what it actually is: something made to last, that did.
        </p>
        <p>
          Every entry in the archive is a one-of-one. Each has a recorded history, a restoration
          log, and a maker's note. The goal is permanence — a documented record of objects
          worth keeping.
        </p>
      </div>

      <div class="about-divider"></div>

      <div class="about-portrait-row">
        <img class="about-portrait" src="ARTIST.jpeg" alt="Vincent Feliciano">
        <div>
          <div class="about-eyebrow" style="margin-bottom:4px">THE MAKER</div>
          <div class="about-maker-name">Vincent Feliciano</div>
        </div>
      </div>
      <div class="about-body">
        <p>
          The background doesn't fit neatly into one category. Front-end development, graphic
          design, product thinking, woodworking, automotive restoration, 3D fabrication,
          illustration, writing. The common thread isn't the medium.
        </p>
        <p>
          It's the process: take something rough or unfinished, understand what it wants to be,
          and make it that. Whether it's a piece of furniture, a brand, a digital product,
          or an object that no longer has a name for what it is.
        </p>
        <p>
          OBJ.52 exists because restoration is one of the few things that uses all of it at once.
          The eye for design. The patience to work slowly. The ability to see what something
          could be before it is. And the discipline to stop before you do too much.
        </p>
      </div>

      <div class="about-divider"></div>

      <div class="about-skills">
        <span class="about-skill-tag">FURNITURE RESTORATION</span>
        <span class="about-skill-tag">FRONT-END DEVELOPMENT</span>
        <span class="about-skill-tag">GRAPHIC DESIGN</span>
        <span class="about-skill-tag">3D FABRICATION</span>
        <span class="about-skill-tag">PRODUCT DESIGN</span>
        <span class="about-skill-tag">ILLUSTRATION</span>
        <span class="about-skill-tag">AUTOMOTIVE</span>
        <span class="about-skill-tag">WOODWORKING</span>
        <span class="about-skill-tag">BRANDING</span>
        <span class="about-skill-tag">WRITING</span>
      </div>

      <div class="about-contact-line">
        INQUIRIES &amp; COMMISSIONS<br>
        <a href="contact.html">hello@obj52.com</a>
      </div>

      <div class="social-icons">
        <a href="#" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a href="#" aria-label="TikTok">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
          </svg>
        </a>
        <a href="#" aria-label="YouTube">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
          </svg>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  document.getElementById('aboutPanelClose').addEventListener('click', closeAbout);
  panel.addEventListener('click', e => { if (e.target === panel) closeAbout(); });
}

function openAbout() {
  document.getElementById('aboutPanel').classList.add('open');
  isHovered = true;
}

function closeAbout() {
  document.getElementById('aboutPanel').classList.remove('open');
  isHovered = false;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAbout(); });

/* ── FULLSCREEN LIGHTBOX ──────────────────── */

function initLightbox() {
  const lb = document.createElement('div');
  lb.className = 'img-lightbox';
  lb.id = 'imgLightbox';
  lb.innerHTML = `
    <button class="lb-close" id="lbClose">CLOSE ×</button>
    <button class="lb-arrow lb-prev" id="lbPrev">&#8592;</button>
    <img class="lb-img" id="lbImg" src="" alt="">
    <button class="lb-arrow lb-next" id="lbNext">&#8594;</button>
    <div class="lb-counter" id="lbCounter"></div>
  `;
  document.body.appendChild(lb);

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.getElementById('lbPrev').addEventListener('click', () => lbNav(-1));
  document.getElementById('lbNext').addEventListener('click', () => lbNav(1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
    if (e.key === 'Escape')     closeLightbox();
  });
}

function lbNav(dir) {
  if (!currentPiece) return;
  const len = currentPiece.images.length;
  lbIndex = (lbIndex + dir + len) % len;
  updateLbImage();
}

function updateLbImage() {
  const img = document.getElementById('lbImg');
  const counter = document.getElementById('lbCounter');
  const images = currentPiece.images;
  gsap.to(img, { opacity: 0, duration: 0.12, onComplete: () => {
    img.src = `${currentPiece.folder}/${images[lbIndex]}`;
    gsap.to(img, { opacity: 1, duration: 0.18 });
  }});
  counter.textContent = images.length > 1 ? `${lbIndex + 1} / ${images.length}` : '';
  document.getElementById('lbPrev').style.opacity = images.length > 1 ? '1' : '0';
  document.getElementById('lbNext').style.opacity = images.length > 1 ? '1' : '0';
}

function openLightbox(startIndex) {
  if (!currentPiece) return;
  lbIndex = startIndex;
  const img = document.getElementById('lbImg');
  img.src = `${currentPiece.folder}/${currentPiece.images[lbIndex]}`;
  const counter = document.getElementById('lbCounter');
  counter.textContent = currentPiece.images.length > 1 ? `${lbIndex + 1} / ${currentPiece.images.length}` : '';
  document.getElementById('lbPrev').style.opacity = currentPiece.images.length > 1 ? '1' : '0';
  document.getElementById('lbNext').style.opacity = currentPiece.images.length > 1 ? '1' : '0';
  document.getElementById('imgLightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('imgLightbox').classList.remove('open');
}

/* ── INIT ─────────────────────────────────── */

initCart();
initAbout();
initLightbox();
renderGallery('all');

/* Re-render on orientation/resize so column count stays correct */
window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(() => renderGallery(currentFilter), 200);
});
