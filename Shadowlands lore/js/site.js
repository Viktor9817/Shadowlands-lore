(function () {
  // Delayed preview popover for gallery cards
  const previewCards = document.querySelectorAll('[data-preview-src]');

  if (previewCards.length > 0) {
    const preview = document.createElement('div');
    preview.className = 'preview-popover';
    const previewImg = document.createElement('img');
    previewImg.alt = '';
    preview.appendChild(previewImg);
    document.body.appendChild(preview);

    let activeCard = null;
    const previewTimers = new Map();

    const hidePreview = () => {
      preview.classList.remove('is-visible');
      activeCard = null;
    };

    const positionPreview = (card) => {
      if (!activeCard) {
        return;
      }

      const cardRect = card.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      let left = window.scrollX + cardRect.right + 24;

      if (left + previewRect.width > window.scrollX + viewportWidth) {
        left = window.scrollX + cardRect.left - previewRect.width - 24;
      }

      let top =
        window.scrollY +
        cardRect.top +
        cardRect.height / 2 -
        previewRect.height / 2;

      const minTop = window.scrollY + 16;
      const maxTop =
        window.scrollY + viewportHeight - previewRect.height - 16;

      if (top < minTop) {
        top = minTop;
      } else if (top > maxTop) {
        top = maxTop;
      }

      preview.style.left = `${Math.max(16, left)}px`;
      preview.style.top = `${top}px`;
      preview.classList.add('is-visible');
    };

    const showPreview = (card) => {
      const src = card.getAttribute('data-preview-src');
      const alt =
        card.getAttribute('data-preview-alt') ||
        card.querySelector('img')?.getAttribute('alt') ||
        '';

      if (!src) {
        return;
      }

      activeCard = card;
      preview.classList.remove('is-visible');
      previewImg.alt = alt;

      const finalize = () => {
        positionPreview(card);
      };

      if (previewImg.getAttribute('src') === src && previewImg.complete) {
        finalize();
      } else {
        previewImg.addEventListener(
          'load',
          function handleLoad() {
            previewImg.removeEventListener('load', handleLoad);
            finalize();
          }
        );
        previewImg.setAttribute('src', src);
      }
    };

    previewCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        const timer = window.setTimeout(() => showPreview(card), 2000);
        previewTimers.set(card, timer);
      });

      card.addEventListener('mouseleave', () => {
        const timer = previewTimers.get(card);
        if (timer) {
          window.clearTimeout(timer);
          previewTimers.delete(card);
        }
        hidePreview();
      });
    });

    window.addEventListener('scroll', () => {
      if (activeCard) {
        hidePreview();
      }
    });

    window.addEventListener('resize', () => {
      if (activeCard) {
        hidePreview();
      }
    });
  }

})();

