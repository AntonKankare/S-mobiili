// Simple state + UI wiring for the coupon demo
(function(){
  const qs = (sel) => document.querySelector(sel);
  const actionBtn = qs('#action-btn');
  const sheet = qs('#confirm-sheet');
  const overlay = qs('#overlay');
  const cancelBtn = qs('#cancel-btn');
  const confirmBtn = qs('#confirm-btn');
  const redeemStatus = qs('#redeem-status');
  const redeemTimeEl = qs('#redeem-time');
  const validUntilEl = qs('#valid-until');
  const backBtn = qs('.back');
  const legalEl = qs('.muted');
  const heroImage = qs('#hero-image');
  const titleEl = qs('.title');
  const discountEl = qs('.discount');

  // Edit UI elements
  const editHitbox = qs('.edit-hitbox');
  const editSheet = qs('#edit-sheet');
  const editCancel = qs('#edit-cancel');
  const editSave = qs('#edit-save');
  const editReset = qs('#edit-reset');
  const imgInput = qs('#img-input');
  const titleInput = qs('#title-input');
  const legalInput = qs('#legal-input');
  const discountInput = qs('#discount-input');
  const validInput = qs('#valid-input');

  // Configure validity date (example to match screenshots)
  validUntilEl.textContent = '14.11.2025';

  // LocalStorage key
  const KEY = 'coupon_redeemed_at_v1';
  const TITLE_KEY = 'custom_title_v1';
  const LEGAL_KEY = 'custom_legal_v1';
  const IMAGE_KEY = 'custom_image_v1';
  const DISCOUNT_KEY = 'custom_discount_v1';
  const VALID_KEY = 'custom_valid_v1';

  function fmtDateTime(d){
    const pad = (n)=>String(n).padStart(2,'0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth()+1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${day}.${month}.${year} klo ${hours}:${mins}`;
  }

  function updateUI(){
    const ts = localStorage.getItem(KEY);
    const redeemed = !!ts;
    if(redeemed){
      redeemStatus.classList.remove('hidden');
      redeemTimeEl.textContent = fmtDateTime(new Date(Number(ts)));
      actionBtn.style.display = 'none'; // hide CTA after redeem to match flow
    }else{
      redeemStatus.classList.add('hidden');
      actionBtn.style.display = 'block';
      actionBtn.textContent = 'Näytä myyjälle';
    }
  }

  function openSheet(){
    var appEl = document.querySelector('.app');
    if(appEl){ appEl.classList.add('sheet-open'); }
    overlay.classList.remove('hidden');
    sheet.classList.remove('hidden');
    // use class for slide-in
    requestAnimationFrame(()=>sheet.classList.add('open'));
  }
  function closeSheet(){
    sheet.classList.remove('open');
    setTimeout(()=>{
      overlay.classList.add('hidden');
      sheet.classList.add('hidden');
      var appEl = document.querySelector('.app');
      if(appEl){ appEl.classList.remove('sheet-open'); }
    }, 180);
  }

  // Edit sheet helpers
  let editOpen = false;
  function openEditSheet(){
    // Prefill fields with current values
    if (titleInput && titleEl) titleInput.value = titleEl.textContent || '';
    if (legalInput && legalEl) legalInput.value = legalEl.textContent || '';
    if (imgInput) imgInput.value = '';
    if (discountInput && discountEl) {
      const t = discountEl.textContent || '';
      const m = t.match(/(\d{1,3})/);
      discountInput.value = m ? m[1] : '';
    }
    if (validInput && validUntilEl) {
      validInput.value = validUntilEl.textContent || '';
    }
    var appEl = document.querySelector('.app');
    if(appEl){ appEl.classList.add('sheet-open'); }
    overlay.classList.remove('hidden');
    editSheet.classList.remove('hidden');
    requestAnimationFrame(()=>editSheet.classList.add('open'));
    editOpen = true;
  }
  function closeEditSheet(){
    editSheet.classList.remove('open');
    setTimeout(()=>{
      overlay.classList.add('hidden');
      editSheet.classList.add('hidden');
      var appEl = document.querySelector('.app');
      if(appEl){ appEl.classList.remove('sheet-open'); }
    }, 180);
    editOpen = false;
  }
  function applyTitleLegal(title, legal){
    if (titleEl && typeof title === 'string' && title.trim()){
      titleEl.textContent = title.trim();
    }
    if (legalEl && typeof legal === 'string' && legal.trim()){
      legalEl.textContent = legal.trim();
    }
  }
  function commitEdits(){
    const newTitle = titleInput ? titleInput.value : '';
    const newLegal = legalInput ? legalInput.value : '';
    const file = imgInput && imgInput.files && imgInput.files[0] ? imgInput.files[0] : null;
    const newDiscountRaw = discountInput ? String(discountInput.value || '').trim() : '';
    const newValid = validInput ? String(validInput.value || '').trim() : '';
    const fmtDiscount = (val) => {
      if (!val) return '';
      const m = String(val).match(/(\d{1,3})/);
      if (!m) return '';
      let n = parseInt(m[1], 10);
      if (isNaN(n)) return '';
      if (n < 0) n = Math.abs(n);
      if (n > 100) n = 100;
      return `-${n} %`;
    };
    const newDiscount = fmtDiscount(newDiscountRaw);

    function finalize(){
      // Save texts
      if (newTitle && newTitle.trim()) localStorage.setItem(TITLE_KEY, newTitle.trim());
      if (newLegal && newLegal.trim()) localStorage.setItem(LEGAL_KEY, newLegal.trim());
      if (newDiscount) localStorage.setItem(DISCOUNT_KEY, newDiscount);
      if (newValid) localStorage.setItem(VALID_KEY, newValid);
      applyTitleLegal(newTitle, newLegal);
      if (discountEl && newDiscount) discountEl.textContent = newDiscount;
      if (validUntilEl && newValid) validUntilEl.textContent = newValid;
      closeEditSheet();
    }

    if (file){
      const reader = new FileReader();
      reader.onload = function(){
        const dataUrl = String(reader.result || '');
        if (dataUrl && heroImage){
          heroImage.src = dataUrl;
          // Hide fallback if any
          const fb = document.getElementById('hero-fallback');
          if (fb) fb.style.display = 'none';
          localStorage.setItem(IMAGE_KEY, dataUrl);
        }
        finalize();
      };
      reader.readAsDataURL(file);
    } else {
      finalize();
    }
  }

  // Cashier view removed – redemption returns to card

  // Main button behavior
  actionBtn.addEventListener('click', () => {
    // Always open confirmation sheet; CTA is hidden after redeem
    openSheet();
  });

  cancelBtn.addEventListener('click', closeSheet);
  overlay.addEventListener('click', ()=>{
    // Close whichever sheet is open
    if (editOpen) { closeEditSheet(); } else { closeSheet(); }
  });
  confirmBtn.addEventListener('click', ()=>{
    const now = Date.now();
    localStorage.setItem(KEY, String(now));
    updateUI();
    // Close sheet and return to the card – no intermediate screen
    closeSheet();
  });

  // Back arrow: reset the entire view
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      try { closeSheet(); } catch (e) {}
      try { closeEditSheet(); } catch (e) {}
      localStorage.removeItem(KEY);
      updateUI();
      // Scroll to top to mimic a fresh view
      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo(0, 0);
      }
    });
  }

  // Edit hitbox behavior: first tap opens editor, second tap saves
  if (editHitbox){
    editHitbox.addEventListener('click', () => {
      if (!editOpen) {
        openEditSheet();
      } else {
        commitEdits();
      }
    });
  }
  if (editCancel) editCancel.addEventListener('click', closeEditSheet);
  if (editSave) editSave.addEventListener('click', commitEdits);
  if (editReset) editReset.addEventListener('click', () => {
    try {
      // Remove saved customizations
      localStorage.removeItem(TITLE_KEY);
      localStorage.removeItem(LEGAL_KEY);
      localStorage.removeItem(IMAGE_KEY);
      localStorage.removeItem(DISCOUNT_KEY);
      // Restore defaults in UI
      if (titleEl) titleEl.textContent = 'Valitsemasi hillo tai säilyke';
      if (legalEl) legalEl.textContent = 'Tällä kupongilla valitsemasi hillo tai säilyke -25 %. 1 kpl/kuponki. Lunastettavissa 1.–14.11.2025 TOK:n Prismasta, S-marketista, Salesta tai ABC-liikennemyymälästä. Ei voimassa verkkokaupassa. Ei voi yhdistää muihin etuihin. Ei koske punalaputettuja tuotteita. Kuvat esimerkkejä, valikoima vaihtelee myymälöittäin.';
      if (discountEl) discountEl.textContent = '-25 %';
      if (heroImage) {
        heroImage.src = 'assets/coupon.jpg';
        const fb = document.getElementById('hero-fallback');
        if (fb) fb.style.display = 'none';
      }
      // Persist defaults to ensure they stick across reloads
      localStorage.setItem(TITLE_KEY, 'Valitsemasi hillo tai säilyke');
      localStorage.setItem(LEGAL_KEY, 'Tällä kupongilla valitsemasi hillo tai säilyke -25 %. 1 kpl/kuponki. Lunastettavissa 1.–14.11.2025 TOK:n Prismasta, S-marketista, Salesta tai ABC-liikennemyymälästä. Ei voimassa verkkokaupassa. Ei voi yhdistää muihin etuihin. Ei koske punalaputettuja tuotteita. Kuvat esimerkkejä, valikoima vaihtelee myymälöittäin.');
      localStorage.setItem(DISCOUNT_KEY, '-25 %');
      // For image we keep path; not stored to avoid base64 bloat, but ok to clear
      localStorage.removeItem(IMAGE_KEY);
      // Update form fields too
      if (titleInput) titleInput.value = titleEl ? (titleEl.textContent || '') : '';
      if (legalInput) legalInput.value = legalEl ? (legalEl.textContent || '') : '';
      if (discountInput) discountInput.value = '25';
      if (imgInput) imgInput.value = '';
      // Close editor for clarity
      closeEditSheet();
    } catch (e) {}
  });

  // Initialize
  if (legalEl && !localStorage.getItem(LEGAL_KEY)) {
    // Default long text if none saved yet
    legalEl.textContent = 'Tällä kupongilla valitsemasi hillo tai säilyke -25 %. 1 kpl/kuponki. Lunastettavissa 1.–14.11.2025 TOK:n Prismasta, S-marketista, Salesta tai ABC-liikennemyymälästä. Ei voimassa verkkokaupassa. Ei voi yhdistää muihin etuihin. Ei koske punalaputettuja tuotteita. Kuvat esimerkkejä, valikoima vaihtelee myymälöittäin.';
  }
  if (titleEl && !localStorage.getItem(TITLE_KEY)) {
    titleEl.textContent = 'Valitsemasi hillo tai säilyke';
  }

  // Apply any saved customizations
  (function applySaved(){
    try {
      const st = localStorage.getItem(TITLE_KEY);
      const sl = localStorage.getItem(LEGAL_KEY);
      const si = localStorage.getItem(IMAGE_KEY);
      const sd = localStorage.getItem(DISCOUNT_KEY);
      const sv = localStorage.getItem(VALID_KEY);
      if (st && titleEl) titleEl.textContent = st;
      if (sl && legalEl) legalEl.textContent = sl;
      if (si && heroImage) {
        heroImage.src = si;
        const fb = document.getElementById('hero-fallback');
        if (fb) fb.style.display = 'none';
      }
      if (sd && discountEl) discountEl.textContent = sd;
      if (sv && validUntilEl) validUntilEl.textContent = sv;
    } catch (e) {}
  })();
  // Adjust confirm sheet content to match desired layout
  try {
    var _desc = document.querySelector('#confirm-sheet p');
    if (_desc && _desc.parentElement) {
      _desc.outerHTML = '<p class="sheet-lead">'+
        'Vahvista, ett\u00E4 kuponki k\u00E4ytet\u00E4\u00E4n nyt.'+
        '</p>'+
        '<p>'+
        'Voit k\u00E4ytt\u00E4\u00E4 kupongin vain kerran ja ostotapahtuman yhteydess\u00E4. '+
        'Lunasta kuponki painikkeella ja n\u00E4yt\u00E4 lunastettu kuponki kassalla.'+
        '</p>'+
        '<p class="sheet-note">'+
        'Jos haluat k\u00E4ytt\u00E4\u00E4 kupongin my\u00F6hemmin, paina Peruuta.'+
        '</p>';
    }
  } catch (_) {}
  updateUI();
})();
