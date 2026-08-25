// ============================================================
// SESIÓN
// ============================================================
let SMU_USER = null;
let SMU_PROFILE = null;
let SMU_FAVORITES = new Set();
let SMU_CURRENT_PRODUCT = null;

const smuSessionReady = (async () => {
  const session = await smuGetSession();
  if (!session) {
    window.location.href = '../Registro/SignIn.html';
    throw new Error('sin sesión');
  }
  SMU_USER = session.user;
  return SMU_USER;
})();

// ============================================================
// ESTADO DEL MARKETPLACE
// ============================================================
let category = 'Todos', mode = 'Todos', sortMode = 'recientes', favoritesOnly = false;
const input = document.querySelector('#searchInput'), grid = document.querySelector('#productGrid');

grid.insertAdjacentHTML('beforebegin', '<div class="market-tabs" id="marketTabs"><button class="market-tab active" data-mode="Intercambio"><i class="bi bi-arrow-left-right"></i> Intercambio</button><button class="market-tab" data-mode="Venta"><i class="bi bi-tag"></i> Venta</button><button class="market-tab" data-mode="Subasta"><i class="bi bi-hammer"></i> Subasta</button></div>');
const tabs = document.querySelector('#marketTabs'); Object.assign(tabs.style, { display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '-4px 0 24px' });
document.querySelectorAll('.market-tab').forEach(button => {
  Object.assign(button.style, { border: '1px solid #e8d9c0', borderRadius: '9px', padding: '11px 16px', background: '#fffdf8', color: '#4b3929', fontWeight: '700' });
  button.onclick = () => {
    document.querySelectorAll('.market-tab').forEach(tab => { tab.classList.remove('active'); Object.assign(tab.style, { background: '#fffdf8', color: '#4b3929', borderColor: '#e8d9c0' }); });
    button.classList.add('active');
    Object.assign(button.style, { background: '#2d6738', color: '#fff', borderColor: '#2d6738' });
    mode = button.dataset.mode;
    smuUpdateSortOptions();
    render();
  };
});
const firstMarketTab = document.querySelector('.market-tab.active');
Object.assign(firstMarketTab.style, { background: '#2d6738', color: '#fff', borderColor: '#2d6738' });

function smuTruncate(text, n) { if (!text) return ''; return text.length > n ? text.slice(0, n).trim() + '…' : text; }

function smuPriceLabel(p) {
  if (p.transaction_type === 'Venta') return '$ ' + Number(p.price).toFixed(2);
  if (p.transaction_type === 'Subasta') return 'SUBASTA';
  return 'INTERCAMBIO';
}

function smuProductCard(p) {
  const isFav = SMU_FAVORITES.has(p.id);
  return `<article class="card" data-id="${p.id}"><div class="product-image"><img src="${p.images[0]}" alt="${p.title}"><span class="type-badge ${p.transaction_type.toLowerCase()}">${p.transaction_type}</span><button type="button" class="fav-btn ${isFav ? 'active' : ''}" title="Favorito"><i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i></button></div><div class="card-body"><h3>${p.title}</h3><p>${p.category}${p.description ? ' · ' + smuTruncate(p.description, 60) : ''}</p><div class="meta"><span>${new Date(p.created_at).toLocaleDateString('es-PA')}</span><strong>${smuPriceLabel(p)}</strong></div></div></article>`;
}

function smuUpdateSortOptions() {
  const priceOpts = document.querySelectorAll('#sortSelect option[value^="precio_"]');
  priceOpts.forEach(o => o.hidden = mode !== 'Venta');
  if (mode !== 'Venta' && sortMode.startsWith('precio_')) {
    sortMode = 'recientes';
    document.querySelector('#sortSelect').value = 'recientes';
  }
}

async function render() {
  const q = input.value.toLowerCase().trim();
  let qb = smuSupabase.from('products').select('*').eq('status', 'Disponible');

  if (category !== 'Todos') qb = qb.eq('category', category);
  if (mode !== 'Todos') qb = qb.eq('transaction_type', mode);
  if (q) qb = qb.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  switch (sortMode) {
    case 'antiguos': qb = qb.order('created_at', { ascending: true }); break;
    case 'nombre_az': qb = qb.order('title', { ascending: true }); break;
    case 'nombre_za': qb = qb.order('title', { ascending: false }); break;
    case 'precio_asc': qb = qb.order('price', { ascending: true, nullsFirst: false }); break;
    case 'precio_desc': qb = qb.order('price', { ascending: false, nullsFirst: false }); break;
    default: qb = qb.order('created_at', { ascending: false });
  }

  const { data, error } = await qb;
  if (error) { console.error('Error cargando productos:', error); toast('No se pudieron cargar los productos.'); return; }

  let list = data || [];
  if (favoritesOnly) list = list.filter(p => SMU_FAVORITES.has(p.id));

  grid.innerHTML = list.map(smuProductCard).join('');

  grid.querySelectorAll('.card[data-id]').forEach(card => {
    card.onclick = () => smuOpenProductDetail(card.dataset.id);
    const favBtn = card.querySelector('.fav-btn');
    if (favBtn) favBtn.onclick = (e) => { e.stopPropagation(); smuToggleFavorite(card.dataset.id); };
  });

  const sectionName = mode === 'Todos' ? 'Todos los juguetes' : `Productos para ${mode.toLowerCase()}`;
  document.querySelector('#listingTitle').textContent = category === 'Todos' ? sectionName : `${category} · ${mode === 'Todos' ? 'Todos' : mode}`;
  document.querySelector('#emptyState').hidden = list.length > 0;
  document.querySelector('#searchMessage').textContent = q ? `${list.length} resultado${list.length === 1 ? '' : 's'} encontrado${list.length === 1 ? '' : 's'}.` : '';
}

document.querySelectorAll('.category').forEach(b => b.onclick = () => {
  document.querySelector('.category.active').classList.remove('active');
  b.classList.add('active');
  category = b.dataset.category;
  render();
  document.querySelector('#explorar').scrollIntoView({ behavior: 'smooth' });
  document.querySelector('#clearFilters').hidden = category === 'Todos' && !input.value && mode === 'Todos';
});
document.querySelector('#searchForm').onsubmit = e => {
  e.preventDefault(); render();
  document.querySelector('#explorar').scrollIntoView({ behavior: 'smooth' });
  document.querySelector('#clearFilters').hidden = !input.value && category === 'Todos' && mode === 'Todos';
};
document.querySelector('#clearFilters').onclick = () => {
  category = 'Todos'; mode = 'Todos'; input.value = '';
  document.querySelector('.category.active').classList.remove('active');
  document.querySelector('[data-category="Todos"]').classList.add('active');
  document.querySelectorAll('.market-tab').forEach(tab => { tab.classList.remove('active'); Object.assign(tab.style, { background: '#fffdf8', color: '#4b3929', borderColor: '#e8d9c0' }); });
  smuUpdateSortOptions();
  document.querySelector('#clearFilters').hidden = true;
  render();
};
document.querySelector('#sortSelect').onchange = (e) => { sortMode = e.target.value; render(); };
document.querySelector('#favoritesToggle').onclick = () => {
  favoritesOnly = !favoritesOnly;
  document.querySelector('#favoritesToggle').classList.toggle('active', favoritesOnly);
  render();
};

function view(name) { document.querySelector('#homeView').hidden = name !== 'home'; document.querySelector('#profileView').hidden = name !== 'profile'; document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('active', x.dataset.view === name)); scrollTo(0, 0) }
document.querySelectorAll('[data-view]').forEach(x => x.onclick = e => { e.preventDefault(); view(x.dataset.view) });
const toast = t => { const x = document.querySelector('#toast'); x.textContent = t; x.hidden = false; setTimeout(() => x.hidden = true, 2500) }, open = id => document.querySelector('#' + id).hidden = false;
document.querySelector('#postButton').onclick = () => { resetPostForm(); open('postModal') };
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => document.querySelector('#' + b.dataset.close).hidden = true);
document.querySelectorAll('.modal-backdrop').forEach(x => x.onclick = e => { if (e.target === x) x.hidden = true });

// ============================================================
// PERFIL (sin cambios respecto a la versión anterior)
// ============================================================
async function smuLoadProfile(user) {
  let { data: row, error } = await smuSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) console.error('Error cargando perfil:', error);
  if (!row) {
    const meta = user.user_metadata || {};
    const initial = { id: user.id, name: meta.full_name || meta.name || '', cedula: meta.id_card || meta.cedula || '', phone: meta.phone || '', avatar_url: null, bio: '', location: '' };
    const { data: created, error: insertError } = await smuSupabase.from('profiles').insert(initial).select().single();
    if (insertError) { console.error('Error creando perfil:', insertError); row = initial; } else row = created;
  }
  return row;
}

function smuRenderProfile() {
  const name = SMU_PROFILE.name || (SMU_USER.email ? SMU_USER.email.split('@')[0] : 'Usuario');
  document.querySelector('#profileName').textContent = name;
  document.querySelector('#shortName').textContent = name.split(' ')[0];
  document.querySelector('#profileEmail').textContent = SMU_USER.email || '—';
  document.querySelector('#profilePhone').textContent = SMU_PROFILE.phone || '—';
  document.querySelector('#profileCedula').textContent = SMU_PROFILE.cedula || '—';
  document.querySelector('#profileLocation').textContent = SMU_PROFILE.location || '—';
  document.querySelector('#profileBio').textContent = SMU_PROFILE.bio || '—';
  if (SMU_PROFILE.avatar_url) avatar.src = SMU_PROFILE.avatar_url;
  const memberSince = document.querySelector('#memberSince');
  if (memberSince && SMU_USER.created_at) memberSince.textContent = new Date(SMU_USER.created_at).getFullYear();
}

function smuOpenEditModal() {
  if (!SMU_PROFILE) { toast('Tu perfil todavía se está cargando, intenta de nuevo.'); return; }
  document.querySelector('#nameField').value = SMU_PROFILE.name || '';
  document.querySelector('#emailField').value = SMU_USER.email || '';
  document.querySelector('#phoneField').value = SMU_PROFILE.phone || '';
  document.querySelector('#locationField').value = SMU_PROFILE.location || '';
  document.querySelector('#bioField').value = SMU_PROFILE.bio || '';
  document.querySelector('#profileFormError').hidden = true;
  open('editModal');
}
document.querySelector('#editProfile').onclick = smuOpenEditModal;
document.querySelector('#editInfo').onclick = smuOpenEditModal;

document.querySelector('#profileForm').onsubmit = async (e) => {
  e.preventDefault();
  const errorBox = document.querySelector('#profileFormError');
  errorBox.hidden = true;
  const name = document.querySelector('#nameField').value.trim();
  const phone = document.querySelector('#phoneField').value.trim();
  const location = document.querySelector('#locationField').value.trim();
  const bio = document.querySelector('#bioField').value.trim();
  if (!name || !location) { errorBox.textContent = 'El nombre y la ubicación son obligatorios.'; errorBox.hidden = false; return; }
  const { data, error } = await smuSupabase.from('profiles').update({ name, phone, location, bio }).eq('id', SMU_USER.id).select().single();
  if (error) { errorBox.textContent = 'No se pudo guardar: ' + error.message; errorBox.hidden = false; return; }
  SMU_PROFILE = data; smuRenderProfile();
  document.querySelector('#editModal').hidden = true;
  toast('Perfil actualizado correctamente.');
};

document.querySelector('#logoutButton').onclick = () => open('logoutModal');
document.querySelector('#confirmLogout').onclick = async () => {
  document.querySelector('#logoutModal').hidden = true;
  const { error } = await smuSupabase.auth.signOut();
  if (error) { toast('No se pudo cerrar sesión: ' + error.message); return; }
  toast('Sesión cerrada. Hasta pronto.');
  setTimeout(() => { window.location.href = '../Registro/SignIn.html'; }, 900);
};
const sideMenu = document.querySelector('.side nav'); Object.assign(sideMenu.style, { display: 'grid', gridTemplateColumns: '1fr', gap: '4px', alignItems: 'stretch', width: '100%' });

// ============================================================
// FOTO DE PERFIL (sin cambios)
// ============================================================
const avatar = document.querySelector('.avatar'), photoBox = document.createElement('div'), photoButton = document.createElement('button'), photoInput = document.createElement('input');
Object.assign(photoBox.style, { position: 'relative', width: '124px', height: '124px', flex: '0 0 124px' });
avatar.parentNode.insertBefore(photoBox, avatar); photoBox.appendChild(avatar);
Object.assign(photoButton.style, { position: 'absolute', right: '0', bottom: '0', width: '37px', height: '37px', borderRadius: '50%', border: '3px solid white', background: '#2d6738', color: 'white', fontSize: '16px' });
photoButton.type = 'button'; photoButton.innerHTML = '<i class="bi bi-camera-fill"></i>'; photoButton.title = 'Cambiar foto de perfil'; photoBox.appendChild(photoButton);
photoInput.type = 'file'; photoInput.accept = 'image/png,image/jpeg,image/webp'; photoInput.hidden = true; photoBox.appendChild(photoInput);
photoButton.onclick = () => photoInput.click();

photoInput.onchange = async () => {
  const file = photoInput.files[0]; if (!file) return;
  if (!SMU_USER) { toast('Tu sesión todavía se está cargando, intenta de nuevo.'); return; }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) { toast('Formato no permitido. Usa JPG, PNG o WEBP.'); photoInput.value = ''; return; }
  if (file.size > 5 * 1024 * 1024) { toast('Elige una foto de hasta 5 MB.'); photoInput.value = ''; return; }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${SMU_USER.id}/avatar.${ext}`;
  toast('Subiendo foto…');
  const { error: uploadError } = await smuSupabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
  if (uploadError) { toast('No se pudo subir la foto: ' + uploadError.message); photoInput.value = ''; return; }
  const { data: publicUrlData } = smuSupabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = publicUrlData.publicUrl + '?t=' + Date.now();
  const { error: updateError } = await smuSupabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', SMU_USER.id);
  if (updateError) { toast('Foto subida pero no se pudo guardar en tu perfil: ' + updateError.message); photoInput.value = ''; return; }
  if (SMU_PROFILE) SMU_PROFILE.avatar_url = avatarUrl;
  avatar.src = avatarUrl; toast('Foto de perfil actualizada.'); photoInput.value = '';
};

// ============================================================
// FAVORITOS
// ============================================================
async function smuLoadFavorites() {
  const { data, error } = await smuSupabase.from('favorites').select('product_id').eq('user_id', SMU_USER.id);
  if (!error && data) SMU_FAVORITES = new Set(data.map(f => f.product_id));
}

async function smuToggleFavorite(productId) {
  if (SMU_FAVORITES.has(productId)) {
    const { error } = await smuSupabase.from('favorites').delete().eq('user_id', SMU_USER.id).eq('product_id', productId);
    if (!error) SMU_FAVORITES.delete(productId);
  } else {
    const { error } = await smuSupabase.from('favorites').insert({ user_id: SMU_USER.id, product_id: productId });
    if (!error) SMU_FAVORITES.add(productId);
    else toast('No se pudo guardar el favorito: ' + error.message);
  }
  render();
  if (!document.querySelector('#productModal').hidden && SMU_CURRENT_PRODUCT && SMU_CURRENT_PRODUCT.id === productId) {
    smuOpenProductDetail(productId);
  }
}

// ============================================================
// DETALLE DE PRODUCTO
// ============================================================
async function smuOpenProductDetail(productId) {
  const { data: p, error } = await smuSupabase.from('products').select('*').eq('id', productId).maybeSingle();
  if (error || !p) { toast('No se pudo cargar el producto.'); return; }
  SMU_CURRENT_PRODUCT = p;

  const { data: ownerProfile } = await smuSupabase.from('profiles').select('name, avatar_url').eq('id', p.user_id).maybeSingle();
  const ownerName = ownerProfile?.name || 'Usuario';
  const isMine = SMU_USER.id === p.user_id;
  const isFav = SMU_FAVORITES.has(p.id);

  document.querySelector('#productDetailBody').innerHTML = `
    <p class="eyebrow">${p.category} · <span class="type-badge ${p.transaction_type.toLowerCase()}">${p.transaction_type}</span></p>
    <h2>${p.title}</h2>
    <div class="detail-gallery">${p.images.map((src, i) => `<img src="${src}" alt="${p.title} ${i + 1}">`).join('')}</div>
    <p>${p.description || 'Sin descripción.'}</p>
    <p class="detail-price"><strong>${smuPriceLabel(p)}</strong></p>
    <p class="detail-owner">Publicado por: <strong>${ownerName}</strong>${isMine ? ' (tú)' : ' <button type="button" id="viewOwnerBtn" class="clear">Ver perfil</button>'}</p>
    <div class="detail-actions">
      <button type="button" id="detailFavBtn" class="fav-btn ${isFav ? 'active' : ''}"><i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i> Favorito</button>
      ${isMine ? '' : '<button type="button" id="contactBtn">Solicitar contacto</button>'}
    </div>`;

  document.querySelector('#detailFavBtn').onclick = () => smuToggleFavorite(p.id);
  const viewOwnerBtn = document.querySelector('#viewOwnerBtn');
  if (viewOwnerBtn) viewOwnerBtn.onclick = () => smuOpenOwnerProfile(p.user_id, ownerName, ownerProfile?.avatar_url);
  const contactBtn = document.querySelector('#contactBtn');
  if (contactBtn) contactBtn.onclick = () => smuRequestContact(p);

  open('productModal');
}

async function smuRequestContact(p) {
  const { error } = await smuSupabase.from('contact_requests').insert({ product_id: p.id, requester_id: SMU_USER.id, owner_id: p.user_id });
  if (error) { toast('No se pudo enviar la solicitud: ' + error.message); return; }
  toast('Solicitud de contacto enviada.');
}

async function smuOpenOwnerProfile(ownerId, name, avatarUrl) {
  document.querySelector('#ownerModalBody').innerHTML = `<img class="avatar" src="${avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85'}" alt="${name}"><h2>${name}</h2><div id="ownerProducts">Cargando artículos…</div>`;
  open('ownerModal');
  const { data } = await smuSupabase.from('products').select('*').eq('user_id', ownerId).eq('status', 'Disponible');
  const box = document.querySelector('#ownerProducts');
  box.innerHTML = (data && data.length) ? `<div class="product-grid">${data.map(smuProductCard).join('')}</div>` : '<p>Sin artículos disponibles.</p>';
  box.querySelectorAll('.card[data-id]').forEach(card => {
    const favBtn = card.querySelector('.fav-btn');
    if (favBtn) favBtn.onclick = (e) => { e.stopPropagation(); smuToggleFavorite(card.dataset.id); };
    card.onclick = () => { document.querySelector('#ownerModal').hidden = true; smuOpenProductDetail(card.dataset.id); };
  });
}

// ============================================================
// MIS JUGUETES PUBLICADOS
// ============================================================
async function smuRenderMyProducts() {
  const list = document.querySelector('#myProductsList');
  const { data, error } = await smuSupabase.from('products').select('*').eq('user_id', SMU_USER.id).order('created_at', { ascending: false });
  if (error) { list.innerHTML = '<p>No se pudieron cargar tus artículos.</p>'; return; }
  if (!data.length) { list.innerHTML = '<p>Todavía no has publicado artículos.</p>'; return; }
  list.innerHTML = data.map(p => `
    <article data-id="${p.id}">
      <img src="${p.images[0]}" alt="${p.title}">
      <div>
        <h3>${p.title}</h3>
        <p>${new Date(p.created_at).toLocaleDateString('es-PA')} · ${p.status}</p>
        <span>${p.transaction_type}</span>
        <div class="my-product-actions">
          <button type="button" class="clear" data-edit="${p.id}">Editar</button>
          <select data-status="${p.id}">
            <option value="Disponible" ${p.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
            <option value="Intercambiado" ${p.status === 'Intercambiado' ? 'selected' : ''}>Intercambiado</option>
            <option value="Vendido" ${p.status === 'Vendido' ? 'selected' : ''}>Vendido</option>
            <option value="Oculto" ${p.status === 'Oculto' ? 'selected' : ''}>Oculto</option>
          </select>
          <button type="button" class="clear" data-delete="${p.id}">Eliminar</button>
        </div>
      </div>
    </article>`).join('');
  list.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => smuOpenEditProduct(b.dataset.edit));
  list.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => smuDeleteProduct(b.dataset.delete));
  list.querySelectorAll('[data-status]').forEach(sel => sel.onchange = () => smuChangeStatus(sel.dataset.status, sel.value));
}

async function smuChangeStatus(id, status) {
  const { error } = await smuSupabase.from('products').update({ status }).eq('id', id);
  if (error) { toast('No se pudo actualizar el estado: ' + error.message); return; }
  toast('Estado actualizado.');
  render();
}

async function smuDeleteProductImages(productId) {
  const prefix = `${SMU_USER.id}/${productId}`;
  const { data: files, error } = await smuSupabase.storage.from('productos').list(prefix);
  if (error || !files || !files.length) return;
  const paths = files.map(f => `${prefix}/${f.name}`);
  await smuSupabase.storage.from('productos').remove(paths);
}

async function smuDeleteProduct(id) {
  if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
  await smuDeleteProductImages(id);
  const { error } = await smuSupabase.from('products').delete().eq('id', id);
  if (error) { toast('No se pudo eliminar: ' + error.message); return; }
  toast('Producto eliminado.');
  smuRenderMyProducts();
  render();
}

// ============================================================
// PUBLICAR ARTÍCULO (real, conectado a Supabase)
// ============================================================
let postTipo = '', postImages = [];
const postValorLabel = document.querySelector('#postValorLabel');
document.querySelectorAll('#postForm .type-option').forEach(opt => opt.onclick = () => {
  document.querySelectorAll('#postForm .type-option').forEach(o => o.classList.remove('active'));
  opt.classList.add('active'); postTipo = opt.dataset.tipo;
  postValorLabel.childNodes[0].textContent = postTipo === 'Subasta' ? 'Puja inicial (opcional)' : postTipo === 'Intercambio' ? 'Valor de referencia (opcional)' : 'Precio';
});
document.querySelector('#postImagenes').onchange = e => {
  const files = [...e.target.files].slice(0, 4 - postImages.length);
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) { toast('Cada foto debe pesar hasta 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => { postImages.push({ file, dataUrl: ev.target.result }); renderPostPreview(); };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
};
function renderPostPreview() {
  document.querySelector('#postPreview').innerHTML = postImages.map((img, i) => `<div class="thumb"><img src="${img.dataUrl}" alt="Foto ${i + 1}"><button type="button" data-i="${i}">×</button></div>`).join('');
  document.querySelectorAll('#postPreview .thumb button').forEach(b => b.onclick = () => { postImages.splice(Number(b.dataset.i), 1); renderPostPreview(); });
}
function resetPostForm() {
  document.querySelector('#postForm').reset(); postTipo = ''; postImages = [];
  document.querySelectorAll('#postForm .type-option').forEach(o => o.classList.remove('active'));
  postValorLabel.childNodes[0].textContent = 'Precio';
  renderPostPreview();
  document.querySelector('#postError').hidden = true;
}

async function smuUploadProductImages(productId, images) {
  const urls = [];
  for (let i = 0; i < images.length; i++) {
    const file = images[i].file;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${SMU_USER.id}/${productId}/${i}.${ext}`;
    const { error } = await smuSupabase.storage.from('productos').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw error;
    const { data } = smuSupabase.storage.from('productos').getPublicUrl(path);
    urls.push(data.publicUrl + '?t=' + Date.now());
  }
  return urls;
}

document.querySelector('#postForm').onsubmit = async (e) => {
  e.preventDefault();
  const errorBox = document.querySelector('#postError');
  errorBox.hidden = true;

  const titulo = document.querySelector('#postTitulo').value.trim();
  const categoria = document.querySelector('#postCategoria').value;
  const valorRaw = document.querySelector('#postValor').value;
  const descripcion = document.querySelector('#postDescripcion').value.trim();

  if (!titulo || !categoria || !postTipo) { errorBox.textContent = 'Completa título, categoría y tipo de transacción.'; errorBox.hidden = false; return; }
  if (postImages.length < 2 || postImages.length > 4) { errorBox.textContent = 'Debes subir entre 2 y 4 fotos.'; errorBox.hidden = false; return; }
  if (postTipo === 'Venta' && (!valorRaw || Number(valorRaw) <= 0)) { errorBox.textContent = 'La venta requiere un precio válido.'; errorBox.hidden = false; return; }

  const submitBtn = e.target.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  toast('Publicando artículo…');

  try {
    const productId = crypto.randomUUID();
    const imageUrls = await smuUploadProductImages(productId, postImages);
    const { error } = await smuSupabase.from('products').insert({
      id: productId,
      user_id: SMU_USER.id,
      title: titulo,
      description: descripcion,
      category: categoria,
      transaction_type: postTipo,
      price: (postTipo === 'Venta' || postTipo === 'Subasta') && valorRaw ? Number(valorRaw) : null,
      images: imageUrls,
      status: 'Disponible'
    });
    if (error) throw error;
    document.querySelector('#postModal').hidden = true;
    toast('Artículo publicado correctamente.');
    render();
    smuRenderMyProducts();
  } catch (err) {
    errorBox.textContent = 'No se pudo publicar: ' + err.message;
    errorBox.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
};

// ============================================================
// EDITAR ARTÍCULO PROPIO
// ============================================================
let editProductId = null, editTipo = '', editImages = [];
const editValorLabel = document.querySelector('#editValorLabel');
document.querySelectorAll('#editTipoToggle .type-option').forEach(opt => opt.onclick = () => {
  document.querySelectorAll('#editTipoToggle .type-option').forEach(o => o.classList.remove('active'));
  opt.classList.add('active'); editTipo = opt.dataset.tipo;
  editValorLabel.childNodes[0].textContent = editTipo === 'Subasta' ? 'Puja inicial (opcional)' : editTipo === 'Intercambio' ? 'Valor de referencia (opcional)' : 'Precio';
});
function renderEditPreview() {
  document.querySelector('#editPreview').innerHTML = editImages.map((img, i) => `<div class="thumb"><img src="${img.type === 'existing' ? img.url : img.dataUrl}" alt="Foto ${i + 1}"><button type="button" data-i="${i}">×</button></div>`).join('');
  document.querySelectorAll('#editPreview .thumb button').forEach(b => b.onclick = () => { editImages.splice(Number(b.dataset.i), 1); renderEditPreview(); });
}
document.querySelector('#editImagenesInput').onchange = e => {
  const files = [...e.target.files].slice(0, 4 - editImages.length);
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) { toast('Cada foto debe pesar hasta 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => { editImages.push({ type: 'new', file, dataUrl: ev.target.result }); renderEditPreview(); };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
};

async function smuOpenEditProduct(id) {
  const { data: p, error } = await smuSupabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error || !p) { toast('No se pudo cargar el producto.'); return; }

  editProductId = p.id;
  editTipo = p.transaction_type;
  editImages = p.images.map(url => ({ type: 'existing', url }));

  document.querySelector('#editTitulo').value = p.title;
  document.querySelector('#editCategoria').value = p.category;
  document.querySelector('#editDescripcion').value = p.description || '';
  document.querySelector('#editValor').value = p.price ?? '';
  document.querySelector('#editEstado').value = p.status;
  document.querySelectorAll('#editTipoToggle .type-option').forEach(o => o.classList.toggle('active', o.dataset.tipo === editTipo));
  editValorLabel.childNodes[0].textContent = editTipo === 'Subasta' ? 'Puja inicial (opcional)' : editTipo === 'Intercambio' ? 'Valor de referencia (opcional)' : 'Precio';
  renderEditPreview();
  document.querySelector('#editError').hidden = true;
  open('editProductModal');
}

document.querySelector('#editProductForm').onsubmit = async (e) => {
  e.preventDefault();
  const errorBox = document.querySelector('#editError');
  errorBox.hidden = true;

  const titulo = document.querySelector('#editTitulo').value.trim();
  const categoria = document.querySelector('#editCategoria').value;
  const valorRaw = document.querySelector('#editValor').value;
  const descripcion = document.querySelector('#editDescripcion').value.trim();
  const estado = document.querySelector('#editEstado').value;

  if (!titulo || !categoria || !editTipo) { errorBox.textContent = 'Completa título, categoría y tipo de transacción.'; errorBox.hidden = false; return; }
  if (editImages.length < 2 || editImages.length > 4) { errorBox.textContent = 'Debes tener entre 2 y 4 fotos.'; errorBox.hidden = false; return; }
  if (editTipo === 'Venta' && (!valorRaw || Number(valorRaw) <= 0)) { errorBox.textContent = 'La venta requiere un precio válido.'; errorBox.hidden = false; return; }

  const submitBtn = e.target.querySelector('button[type=submit]');
  submitBtn.disabled = true;

  try {
    const finalUrls = [];
    for (let i = 0; i < editImages.length; i++) {
      const item = editImages[i];
      if (item.type === 'existing') { finalUrls.push(item.url); continue; }
      const ext = (item.file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${SMU_USER.id}/${editProductId}/${Date.now()}_${i}.${ext}`;
      const { error: upErr } = await smuSupabase.storage.from('productos').upload(path, item.file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: pub } = smuSupabase.storage.from('productos').getPublicUrl(path);
      finalUrls.push(pub.publicUrl + '?t=' + Date.now());
    }

    const { error } = await smuSupabase.from('products').update({
      title: titulo,
      category: categoria,
      description: descripcion,
      transaction_type: editTipo,
      price: (editTipo === 'Venta' || editTipo === 'Subasta') && valorRaw ? Number(valorRaw) : null,
      images: finalUrls,
      status: estado
    }).eq('id', editProductId);
    if (error) throw error;

    document.querySelector('#editProductModal').hidden = true;
    toast('Producto actualizado.');
    smuRenderMyProducts();
    render();
  } catch (err) {
    errorBox.textContent = 'No se pudo guardar: ' + err.message;
    errorBox.hidden = false;
  } finally {
    submitBtn.disabled = false;
  }
};

// ============================================================
// Arranque
// ============================================================
mode = 'Todos'; firstMarketTab.classList.remove('active');
Object.assign(firstMarketTab.style, { background: '#fffdf8', color: '#4b3929', borderColor: '#e8d9c0' });
smuUpdateSortOptions();

(async function bootProfile() {
  try {
    await smuSessionReady;
  } catch {
    return; // ya se redirigió a SignIn.html
  }
  SMU_PROFILE = await smuLoadProfile(SMU_USER);
  smuRenderProfile();
  await smuLoadFavorites();
  render();
  smuRenderMyProducts();
})();
