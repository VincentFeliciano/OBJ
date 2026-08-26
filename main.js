/* =========================================
   OBJ.52 — main.js  (GSAP edition)
   ========================================= */

gsap.registerPlugin(Observer);

/* ── DOM refs ─────────────────────────────── */
const carouselEl = document.getElementById('carousel');
const filterBtns = document.querySelectorAll('.filter-btn');
const pieceCount = document.getElementById('pieceCount');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalBody    = document.getElementById('modalBody');
const swipeDots    = document.getElementById('swipeDots');
const archiveDot   = document.getElementById('archiveDot');

/* ── Config ───────────────────────────────── */
const AUTO_SPEED       = 0.2;   /* px/tick base drift speed              */
const WHEEL_SENSITIVITY= 0.45;  /* wheel delta scale                     */
const DRAG_SENSITIVITY = 0.7;   /* drag delta scale                      */
const FRICTION         = 0.88;  /* velocity decay per tick (0–1)         */
const CARD_GAP         = 18;    /* must match CSS gap px                 */

/* ── State ────────────────────────────────── */
let currentFilter = 'all';
let visiblePieces = [];
let trackEl       = null;
let totalSetWidth = 0;   /* width of ONE set of cards (for wrap math)  */

let xPos      = 0;       /* current track x position                   */
let velX      = 0;       /* scroll velocity (px/tick)                  */
let isHovered = false;
let isDragging= false;
let hasDragged= false;

/* ── RENDER ───────────────────────────────── */

function renderCards(filter) {
  visiblePieces = filter === 'all'
    ? PIECES
    : PIECES.filter(p => p.type === filter);

  pieceCount.textContent = visiblePieces.length;

  /* Rebuild track */
  carouselEl.innerHTML = '';
  trackEl = document.createElement('div');
  trackEl.className = 'carousel-track';
  carouselEl.appendChild(trackEl);

  if (visiblePieces.length === 0) {
    trackEl.innerHTML = '<div class="empty-state">NO OBJECTS IN THIS CATEGORY</div>';
    totalSetWidth = 0;
    return;
  }

  visiblePieces.forEach((piece, i) => trackEl.appendChild(buildCard(piece, i)));

  /* Measure + clone after one paint */
  requestAnimationFrame(() => {
    const originals = [...trackEl.children];

    /* Width of one full set */
    totalSetWidth = originals.reduce(
      (sum, c) => sum + c.offsetWidth + CARD_GAP, 0
    );

    /* Prepend + append clone sets for seamless bidirectional loop */
    const before = document.createDocumentFragment();
    const after  = document.createDocumentFragment();
    originals.forEach(c => {
      const cb = c.cloneNode(true); cb.classList.add('clone');
      const ca = c.cloneNode(true); ca.classList.add('clone');
      before.appendChild(cb);
      after.appendChild(ca);
    });
    trackEl.prepend(before);
    trackEl.appendChild(after);

    /* Start showing the middle (original) set */
    xPos = -totalSetWidth;
    velX = 0;
    gsap.set(trackEl, { x: xPos, skewX: 0 });

    updateDots(0);
    if (archiveDot) archiveDot.style.left = '0%';
  });
}

function buildCard(piece, idx) {
  const card = document.createElement('div');
  card.className = 'piece-card';
  card.dataset.idx = idx;

  card.innerHTML = `
    <div class="card-top">
      <span class="card-designation">${piece.designation}</span>
    </div>
    <div class="card-image">
      <img src="${piece.folder}/${piece.images[0]}" alt="${piece.name}" loading="lazy">
    </div>
    <div class="card-bottom">
      <div class="card-name">${piece.name}</div>
      <div class="card-subtitle">${piece.subtitle}</div>
      <div class="card-type-line">
        <span class="card-type type-${piece.type}">${piece.type}</span>
        <span class="card-edition">&middot; ${piece.edition}</span>
      </div>
      <div class="card-found">${piece.found}</div>
      <div class="card-footer">
        <span class="card-price">${piece.price}</span>
        <span class="card-avail ${piece.status !== 'AVAILABLE' ? 'sold' : ''}">
          <span class="avail-dot ${piece.status === 'AVAILABLE' ? 'on' : 'off'}"></span>
          ${piece.status}
        </span>
      </div>
    </div>
  `;
  return card;
}

/* ── SWIPE DOTS ───────────────────────────── */

function updateDots(active) {
  if (!swipeDots) return;
  swipeDots.innerHTML = visiblePieces.map((_, i) =>
    `<span class="swipe-dot ${i === active ? 'active' : ''}" data-idx="${i}"></span>`
  ).join('');
}

/* ── GSAP TICKER — main animation loop ───── */

gsap.ticker.lagSmoothing(0);

gsap.ticker.add(() => {
  if (!trackEl || totalSetWidth === 0) return;

  /* Auto-scroll when idle */
  if (!isHovered && !isDragging) velX -= AUTO_SPEED;

  /* Advance position */
  xPos += velX;
  velX *= FRICTION;

  /* Seamless wrap — keep xPos in [-totalSetWidth*2, 0] */
  if (xPos < -totalSetWidth * 2) xPos += totalSetWidth;
  if (xPos > 0)                  xPos -= totalSetWidth;

  gsap.set(trackEl, { x: xPos, force3D: true });

  /* Archive dot progress (0–100%) within one set */
  if (archiveDot && totalSetWidth > 0) {
    const pct = (((-xPos - totalSetWidth) % totalSetWidth + totalSetWidth) % totalSetWidth)
                / totalSetWidth * 100;
    archiveDot.style.left = `${pct}%`;
  }
});

/* ── INPUT — wheel ────────────────────────── */

carouselEl.addEventListener('wheel', (e) => {
  e.preventDefault();
  velX -= (e.deltaX + e.deltaY) * WHEEL_SENSITIVITY;
}, { passive: false });

/* ── INPUT — drag via GSAP Observer ──────── */

Observer.create({
  target: carouselEl,
  type: 'pointer',
  preventDefault: false,

  onPress: () => {
    isDragging = true;
    hasDragged = false;
    document.body.style.cursor = 'grabbing';
    carouselEl.style.cursor    = 'grabbing';
  },

  onDrag: (self) => {
    const moved = Math.abs(self.deltaX) + Math.abs(self.deltaY);
    if (moved > 2) hasDragged = true;
    velX += self.deltaX * DRAG_SENSITIVITY;
  },

  onRelease: () => {
    isDragging = false;
    document.body.style.cursor = '';
    carouselEl.style.cursor    = '';
  },

  onHover:    () => { isHovered = true;  },
  onHoverEnd: () => { isHovered = false; },
});

/* ── CLICK (delegated, guards against drag) ─ */

carouselEl.addEventListener('click', (e) => {
  if (hasDragged) { hasDragged = false; return; }
  const card = e.target.closest('.piece-card');
  if (!card) return;
  const idx   = parseInt(card.dataset.idx);
  const piece = visiblePieces[idx];
  if (piece) openModal(piece);
});

/* ── LOCAL STORAGE — views & comments ────── */

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
  const comments = getComments(id);
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  comments.push({ name: name.trim(), text: text.trim(), date });
  localStorage.setItem(`obj52_comments_${id}`, JSON.stringify(comments));
  return comments;
}

function renderCommentsList(id, listEl) {
  const comments = getComments(id);
  if (comments.length === 0) {
    listEl.innerHTML = '<p class="no-comments">No notes yet. Be the first.</p>';
    return;
  }
  listEl.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-meta">
        <span class="comment-name">${c.name.toUpperCase()}</span>
        <span class="comment-date">${c.date}</span>
      </div>
      <p class="comment-text">${c.text}</p>
    </div>
  `).join('');
}

/* ── MODAL ────────────────────────────────── */

function openModal(piece) {
  isHovered = true; /* freeze auto-scroll */

  const hasMultiple = piece.images.length > 1;
  const thumbsHTML  = hasMultiple
    ? `<div class="modal-thumbs">
        ${piece.images.map((img, i) => `
          <img class="modal-thumb ${i === 0 ? 'active' : ''}"
            src="${piece.folder}/${img}"
            alt="${piece.name} ${i + 1}"
            data-src="${piece.folder}/${img}">
        `).join('')}
      </div>`
    : '';

  const dotCls  = piece.status === 'AVAILABLE' ? 'on' : 'off';
  const ctaTxt  = piece.status === 'AVAILABLE'    ? 'INQUIRE ABOUT THIS PIECE'    :
                  piece.status === 'COMMISSIONED' ? 'COMMISSION A SIMILAR PIECE' :
                  piece.status === 'ARCHIVED'     ? 'INQUIRE ABOUT SIMILAR'       : 'JOIN WAITLIST';
  const subject = encodeURIComponent(`Inquiry — ${piece.designation}: ${piece.name}`);

  const preservedHTML = piece.preserved.map(p => `<li>${p}</li>`).join('');
  const rebuiltHTML   = piece.rebuilt.map(r => `<li>${r}</li>`).join('');
  const historyHTML   = piece.objectHistory.map(h =>
    `<div class="timeline-row"><span class="timeline-year">${h.year}</span><span class="timeline-event">${h.event}</span></div>`
  ).join('');
  const materialsStr  = piece.materials.join(', ');

  modalBody.innerHTML = `
    <div class="modal-gallery">
      <img class="modal-main-img" id="modalMainImg"
        src="${piece.folder}/${piece.images[0]}" alt="${piece.name}">
      ${thumbsHTML}
    </div>
    <div class="modal-info">
      <div class="modal-top-row">
        <span class="modal-designation">${piece.designation}</span>
        <span class="modal-status status-${piece.status}">${piece.status}</span>
      </div>
      <h2 class="modal-name">${piece.name}</h2>
      <div class="modal-subtitle-text">${piece.subtitle}</div>
      <div class="modal-divider"></div>

      <div class="modal-section">
        <div class="modal-section-title">THE STORY</div>
        <p class="modal-text">${piece.story}</p>
      </div>

      <div class="modal-divider"></div>

      <div class="modal-section">
        <div class="modal-section-title">THE RESTORATION</div>
        <p class="modal-text">${piece.restorationDesc}</p>
        <div class="modal-two-col">
          <div>
            <div class="modal-col-title">PRESERVED</div>
            <ul class="modal-list">${preservedHTML}</ul>
          </div>
          <div>
            <div class="modal-col-title">REBUILT</div>
            <ul class="modal-list">${rebuiltHTML}</ul>
          </div>
        </div>
      </div>

      <div class="modal-divider"></div>

      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Era</span>
          <span class="detail-value">${piece.era}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Found</span>
          <span class="detail-value">${piece.found}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Materials</span>
          <span class="detail-value">${materialsStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dimensions</span>
          <span class="detail-value">${piece.dimensions}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Edition</span>
          <span class="detail-value">${piece.edition}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Restoration</span>
          <span class="detail-value">${piece.restorationTime}</span>
        </div>
      </div>

      <div class="modal-divider"></div>

      <div class="modal-section">
        <div class="modal-section-title">OBJECT HISTORY</div>
        <div class="modal-timeline">${historyHTML}</div>
      </div>

      <div class="modal-divider"></div>

      <div class="modal-makers-note">
        <div class="modal-section-title">MAKER'S NOTE</div>
        <blockquote class="modal-quote">${piece.makersNote}</blockquote>
      </div>

      <div class="modal-divider"></div>

      <div class="modal-price-row">
        <span class="modal-price">${piece.price}</span>
        <span class="modal-avail">
          <span class="avail-dot ${dotCls}"></span>
          ${piece.status}
        </span>
      </div>
      <a class="modal-cta" href="mailto:hello@obj52.com?subject=${subject}">${ctaTxt}</a>

      <div class="modal-divider"></div>

      <div class="modal-comments-section">
        <div class="modal-comments-header">
          <span class="modal-section-title">ARCHIVE NOTES</span>
          <span class="modal-views-count" id="modalViewCount"></span>
        </div>
        <div class="comments-list" id="commentsList"></div>
        <form class="comment-form" id="commentForm">
          <input class="comment-input" type="text" name="commentName" placeholder="Your name" maxlength="60" required>
          <textarea class="comment-textarea" name="commentText" placeholder="Leave a note about this piece…" maxlength="500" required></textarea>
          <button class="comment-submit" type="submit">LEAVE A NOTE</button>
        </form>
      </div>
    </div>
  `;

  /* Thumbnail switcher */
  const mainImg = document.getElementById('modalMainImg');
  modalBody.querySelectorAll('.modal-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      modalBody.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      gsap.to(mainImg, { opacity: 0, duration: 0.15, onComplete: () => {
        mainImg.src = thumb.dataset.src;
        gsap.to(mainImg, { opacity: 1, duration: 0.2 });
      }});
    });
  });

  /* View count */
  const viewCount = incrementViews(piece.id);
  const viewsEl = document.getElementById('modalViewCount');
  if (viewsEl) viewsEl.textContent = `${viewCount} VIEW${viewCount !== 1 ? 'S' : ''}`;

  /* Comments */
  const commentsList = document.getElementById('commentsList');
  if (commentsList) renderCommentsList(piece.id, commentsList);

  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = commentForm.querySelector('[name="commentName"]').value;
      const text = commentForm.querySelector('[name="commentText"]').value;
      if (name && text) {
        saveComment(piece.id, name, text);
        renderCommentsList(piece.id, commentsList);
        commentForm.reset();
      }
    });
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  isHovered = false; /* resume auto-scroll */
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── FILTERS ──────────────────────────────── */

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderCards(currentFilter);
  });
});

/* ── INIT ─────────────────────────────────── */

renderCards('all');
