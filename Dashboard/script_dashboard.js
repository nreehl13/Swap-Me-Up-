// ============================================================
// SESIÓN: obtenemos la sesión Y el usuario en una sola llamada.
// Si no hay sesión, se redirige (misma protección que antes,
// solo que ahora reutilizamos el user para cargar el perfil).
// ============================================================
let SMU_USER = null;
let SMU_PROFILE = null;

const smuSessionReady = (async () => {
  const session = await smuGetSession();
  if (!session) {
    window.location.href = '../Registro/SignIn.html';
    throw new Error('sin sesión');
  }
  SMU_USER = session.user;
  return SMU_USER;
})();

const products=[
 ['Conejito suave','Peluches','2 a 5 años','2.3 km','https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=700&q=85','Intercambio'],
 ['Oso explorador','Peluches','2 a 6 años','5.2 km','https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=700&q=85','Venta'],
 ['Set espacial','Construcción','6 a 10 años','3.1 km','https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=700&q=85','Subasta'],
 ['Bloques creativos','Construcción','4 a 8 años','1.2 km','https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=700&q=85','Intercambio'],
 ['Camión de rescate','Vehículos','3 a 7 años','1.8 km','https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=700&q=85','Venta'],
 ['Auto de carreras','Vehículos','4 a 8 años','3.7 km','https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=700&q=85','Subasta'],
 ['Muñeca de tela','Muñecas','3 a 6 años','4.5 km','https://images.unsplash.com/photo-1587298723305-79c9404d746b?auto=format&fit=crop&w=700&q=85','Intercambio'],
 ['Casa de muñecas','Muñecas','4 a 9 años','2.1 km','https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=700&q=85','Venta'],
 ['Juego de mesa familiar','Juegos','5 a 10 años','2.9 km','https://images.unsplash.com/photo-1606503153255-59d8b8b3a1d5?auto=format&fit=crop&w=700&q=85','Subasta'],
 ['Rompecabezas de animales','Juegos','3 a 6 años','4.1 km','https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=700&q=85','Intercambio']
];
let category='Todos',mode='Todos';const input=document.querySelector('#searchInput'),grid=document.querySelector('#productGrid');

// Los tres botones que cambian la vista de productos.
grid.insertAdjacentHTML('beforebegin','<div class="market-tabs" id="marketTabs"><button class="market-tab active" data-mode="Intercambio"><i class="bi bi-arrow-left-right"></i> Intercambio</button><button class="market-tab" data-mode="Venta"><i class="bi bi-tag"></i> Venta</button><button class="market-tab" data-mode="Subasta"><i class="bi bi-hammer"></i> Subasta</button></div>');
const tabs=document.querySelector('#marketTabs');Object.assign(tabs.style,{display:'flex',gap:'10px',flexWrap:'wrap',margin:'-4px 0 24px'});
document.querySelectorAll('.market-tab').forEach(button=>{Object.assign(button.style,{border:'1px solid #e8d9c0',borderRadius:'9px',padding:'11px 16px',background:'#fffdf8',color:'#4b3929',fontWeight:'700'});button.onclick=()=>{document.querySelectorAll('.market-tab').forEach(tab=>{tab.classList.remove('active');Object.assign(tab.style,{background:'#fffdf8',color:'#4b3929',borderColor:'#e8d9c0'});});button.classList.add('active');Object.assign(button.style,{background:'#2d6738',color:'#fff',borderColor:'#2d6738'});mode=button.dataset.mode;render();}});
const firstMarketTab=document.querySelector('.market-tab.active');Object.assign(firstMarketTab.style,{background:'#2d6738',color:'#fff',borderColor:'#2d6738'});

function render(){const q=input.value.toLowerCase().trim(),list=products.filter(p=>(category==='Todos'||p[1]===category)&&(mode==='Todos'||p[5]===mode)&&(`${p[0]} ${p[1]} ${p[5]}`).toLowerCase().includes(q));grid.innerHTML=list.map(p=>`<article class="card"><div class="product-image"><img src="${p[4]}" alt="${p[0]}"><span class="type-badge ${p[5].toLowerCase()}">${p[5]}</span></div><div class="card-body"><h3>${p[0]}</h3><p>${p[1]} · ${p[2]}</p><div class="meta"><span><i class="bi bi-geo-alt"></i> ${p[3]}</span><strong>${p[5]==='Venta'?'$ 25.00':p[5]==='Subasta'?'PUJA ACTUAL':'INTERCAMBIO'}</strong></div></div></article>`).join('');const sectionName=mode==='Todos'?'Todos los juguetes':`Productos para ${mode.toLowerCase()}`;document.querySelector('#listingTitle').textContent=category==='Todos'?sectionName:`${category} · ${mode==='Todos'?'Todos':mode}`;document.querySelector('#emptyState').hidden=list.length>0;document.querySelector('#searchMessage').textContent=q?`${list.length} resultado${list.length===1?'':'s'} encontrado${list.length===1?'':'s'}.`:''}
document.querySelectorAll('.category').forEach(b=>b.onclick=()=>{document.querySelector('.category.active').classList.remove('active');b.classList.add('active');category=b.dataset.category;render();document.querySelector('#explorar').scrollIntoView({behavior:'smooth'});document.querySelector('#clearFilters').hidden=category==='Todos'&&!input.value&&mode==='Todos'});
document.querySelector('#searchForm').onsubmit=e=>{e.preventDefault();render();document.querySelector('#explorar').scrollIntoView({behavior:'smooth'});document.querySelector('#clearFilters').hidden=!input.value&&category==='Todos'&&mode==='Todos'};
document.querySelector('#clearFilters').onclick=()=>{category='Todos';mode='Todos';input.value='';document.querySelector('.category.active').classList.remove('active');document.querySelector('[data-category="Todos"]').classList.add('active');document.querySelectorAll('.market-tab').forEach(tab=>{tab.classList.remove('active');Object.assign(tab.style,{background:'#fffdf8',color:'#4b3929',borderColor:'#e8d9c0'});});document.querySelector('#clearFilters').hidden=true;render()};
function view(name){document.querySelector('#homeView').hidden=name!=='home';document.querySelector('#profileView').hidden=name!=='profile';document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===name));scrollTo(0,0)}
document.querySelectorAll('[data-view]').forEach(x=>x.onclick=e=>{e.preventDefault();view(x.dataset.view)});
const toast=t=>{const x=document.querySelector('#toast');x.textContent=t;x.hidden=false;setTimeout(()=>x.hidden=true,2500)},open=id=>document.querySelector('#'+id).hidden=false;
document.querySelector('#postButton').onclick=()=>{resetPostForm();open('postModal')};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.querySelector('#'+b.dataset.close).hidden=true);document.querySelectorAll('.modal-backdrop').forEach(x=>x.onclick=e=>{if(e.target===x)x.hidden=true});

// ============================================================
// PERFIL — reemplaza al antiguo objeto `profile` estático.
// Toda lectura/escritura va contra Supabase (tabla profiles
// y auth.users), nunca contra localStorage/sessionStorage.
// ============================================================

async function smuLoadProfile(user) {
  let { data: row, error } = await smuSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error cargando perfil:', error);
  }

  if (!row) {
    // Cuenta existente o recién creada sin fila en profiles todavía:
    // se auto-provisiona usando lo que ya guardó Sign Up en user_metadata.
    const meta = user.user_metadata || {};
    const initial = {
      id: user.id,
      name: meta.full_name || meta.name || '',
      cedula: meta.id_card || meta.cedula || '',
      phone: meta.phone || '',
      avatar_url: null,
      bio: '',
      location: ''
    };
    const { data: created, error: insertError } = await smuSupabase
      .from('profiles')
      .insert(initial)
      .select()
      .single();

    if (insertError) {
      console.error('Error creando perfil:', insertError);
      row = initial; // seguimos mostrando algo aunque falle el insert
    } else {
      row = created;
    }
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

  if (SMU_PROFILE.avatar_url) {
    avatar.src = SMU_PROFILE.avatar_url;
  }

  const memberSince = document.querySelector('#memberSince');
  if (memberSince && SMU_USER.created_at) {
    memberSince.textContent = new Date(SMU_USER.created_at).getFullYear();
  }
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

  if (!name || !location) {
    errorBox.textContent = 'El nombre y la ubicación son obligatorios.';
    errorBox.hidden = false;
    return;
  }

  const { data, error } = await smuSupabase
    .from('profiles')
    .update({ name, phone, location, bio })
    .eq('id', SMU_USER.id)
    .select()
    .single();

  if (error) {
    errorBox.textContent = 'No se pudo guardar: ' + error.message;
    errorBox.hidden = false;
    return;
  }

  SMU_PROFILE = data;
  smuRenderProfile();
  document.querySelector('#editModal').hidden = true;
  toast('Perfil actualizado correctamente.');
};

document.querySelector('#logoutButton').onclick=()=>open('logoutModal');
document.querySelector('#confirmLogout').onclick=async ()=>{
  document.querySelector('#logoutModal').hidden=true;
  const { error } = await smuSupabase.auth.signOut();
  if (error) { toast('No se pudo cerrar sesión: ' + error.message); return; }
  toast('Sesión cerrada. Hasta pronto.');
  setTimeout(()=>{ window.location.href = '../Registro/SignIn.html'; }, 900);
};
const sideMenu=document.querySelector('.side nav');Object.assign(sideMenu.style,{display:'grid',gridTemplateColumns:'1fr',gap:'4px',alignItems:'stretch',width:'100%'});

// ============================================================
// FOTO DE PERFIL — ahora sube realmente a Supabase Storage
// (bucket "avatars") y guarda la URL en profiles.avatar_url.
// ============================================================
const avatar=document.querySelector('.avatar'),photoBox=document.createElement('div'),photoButton=document.createElement('button'),photoInput=document.createElement('input');Object.assign(photoBox.style,{position:'relative',width:'124px',height:'124px',flex:'0 0 124px'});avatar.parentNode.insertBefore(photoBox,avatar);photoBox.appendChild(avatar);Object.assign(photoButton.style,{position:'absolute',right:'0',bottom:'0',width:'37px',height:'37px',borderRadius:'50%',border:'3px solid white',background:'#2d6738',color:'white',fontSize:'16px'});photoButton.type='button';photoButton.innerHTML='<i class="bi bi-camera-fill"></i>';photoButton.title='Cambiar foto de perfil';photoBox.appendChild(photoButton);photoInput.type='file';photoInput.accept='image/png,image/jpeg,image/webp';photoInput.hidden=true;photoBox.appendChild(photoInput);photoButton.onclick=()=>photoInput.click();

photoInput.onchange = async () => {
  const file = photoInput.files[0];
  if (!file) return;

  if (!SMU_USER) { toast('Tu sesión todavía se está cargando, intenta de nuevo.'); return; }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast('Formato no permitido. Usa JPG, PNG o WEBP.');
    photoInput.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast('Elige una foto de hasta 5 MB.');
    photoInput.value = '';
    return;
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${SMU_USER.id}/avatar.${ext}`;

  toast('Subiendo foto…');

  const { error: uploadError } = await smuSupabase
    .storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) {
    toast('No se pudo subir la foto: ' + uploadError.message);
    photoInput.value = '';
    return;
  }

  const { data: publicUrlData } = smuSupabase.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = publicUrlData.publicUrl + '?t=' + Date.now(); // evita caché tras reemplazar

  const { error: updateError } = await smuSupabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', SMU_USER.id);

  if (updateError) {
    toast('Foto subida pero no se pudo guardar en tu perfil: ' + updateError.message);
    photoInput.value = '';
    return;
  }

  if (SMU_PROFILE) SMU_PROFILE.avatar_url = avatarUrl;
  avatar.src = avatarUrl;
  toast('Foto de perfil actualizada.');
  photoInput.value = '';
};

// Al entrar se ven todos los tipos; las tres pestañas filtran cuando se pulsan.
mode='Todos';firstMarketTab.classList.remove('active');Object.assign(firstMarketTab.style,{background:'#fffdf8',color:'#4b3929',borderColor:'#e8d9c0'});
render();
let postTipo='',postImages=[];
const postValorLabel=document.querySelector('#postValorLabel');
document.querySelectorAll('.type-option').forEach(opt=>opt.onclick=()=>{document.querySelectorAll('.type-option').forEach(o=>o.classList.remove('active'));opt.classList.add('active');postTipo=opt.dataset.tipo;postValorLabel.childNodes[0].textContent=postTipo==='Subasta'?'Puja inicial':postTipo==='Intercambio'?'Valor de referencia (opcional)':'Precio';});
document.querySelector('#postImagenes').onchange=e=>{const files=[...e.target.files].slice(0,6-postImages.length);files.forEach(file=>{if(file.size>5*1024*1024)return;const reader=new FileReader();reader.onload=ev=>{postImages.push({file,dataUrl:ev.target.result});renderPostPreview();};reader.readAsDataURL(file);});e.target.value='';};
function renderPostPreview(){document.querySelector('#postPreview').innerHTML=postImages.map((img,i)=>`<div class="thumb"><img src="${img.dataUrl}" alt="Foto ${i+1}"><button type="button" data-i="${i}">×</button></div>`).join('');document.querySelectorAll('.image-preview .thumb button').forEach(b=>b.onclick=()=>{postImages.splice(Number(b.dataset.i),1);renderPostPreview();});}
function resetPostForm(){document.querySelector('#postForm').reset();postTipo='';postImages=[];document.querySelectorAll('.type-option').forEach(o=>o.classList.remove('active'));postValorLabel.childNodes[0].textContent='Precio';renderPostPreview();document.querySelector('#postError').hidden=true;}
document.querySelector('#postForm').onsubmit=e=>{
 e.preventDefault();
 const titulo=document.querySelector('#postTitulo').value.trim(),valor=document.querySelector('#postValor').value,descripcion=document.querySelector('#postDescripcion').value.trim(),errorBox=document.querySelector('#postError');
 if(!titulo||!postTipo||postImages.length===0||(postTipo!=='Intercambio'&&!valor)){errorBox.textContent='Completa título, tipo de transacción, al menos una foto y el valor (si aplica).';errorBox.hidden=false;return;}
 const nuevoObjeto={titulo,valor:valor?Number(valor):null,descripcion,tipo_transaccion:postTipo,imagenes:postImages.map(img=>img.dataUrl)};
 console.log('Objeto listo para subir a Supabase:',nuevoObjeto);
 document.querySelector('#postModal').hidden=true;
 toast('Artículo listo. La conexión con Supabase se activará próximamente.');
};

// ============================================================
// Arranque: espera la sesión, carga el perfil real y lo pinta.
// ============================================================
(async function bootProfile() {
  try {
    await smuSessionReady;
  } catch {
    return; // ya se redirigió a SignIn.html
  }
  SMU_PROFILE = await smuLoadProfile(SMU_USER);
  smuRenderProfile();
})();
