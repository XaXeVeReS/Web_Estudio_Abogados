document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. PINTADO INSTANTÁNEO DE DATOS GENERALES, PORTADAS Y SECCIONES DE INICIO
    // =====================================================================
    function renderizarContenidoGlobalYHome() {
        if (typeof window.actualizarLayoutMaestro === 'function') {
            window.actualizarLayoutMaestro();
        }

        // A. Portadas y Testimonios (Inicio)
        const portadas = JSON.parse(localStorage.getItem('ureta_portadas_cache') || 'null');
        if (portadas && portadas.length > 0) {
            document.querySelectorAll('.hero-slide').forEach((slideEl, idx) => {
                const p = portadas[idx] || portadas[0];
                if (!p) return;
                if (p.imagen_url) slideEl.style.backgroundImage = `url('${p.imagen_url}')`;
                const subEl = slideEl.querySelector('.hero-badge');
                const titEl = slideEl.querySelector('.hero-title');
                const descEl = slideEl.querySelector('.hero-description');
                if (subEl && p.subtitulo) subEl.textContent = p.subtitulo;
                if (titEl && p.titulo) titEl.textContent = p.titulo;
                if (descEl && p.descripcion_breve) descEl.textContent = p.descripcion_breve;
            });
        }

        const testimonios = JSON.parse(localStorage.getItem('ureta_testimonios_cache') || 'null');
        if (testimonios && testimonios.length > 0) {
            document.querySelectorAll('.testimonial-slide').forEach((tEl, idx) => {
                const t = testimonios[idx % testimonios.length];
                const textoEl = tEl.querySelector('.testimonial-text');
                const autorEl = tEl.querySelector('h4');
                const cargoEl = tEl.querySelector('.testimonial-author span');
                if (textoEl) textoEl.textContent = `"${t.comentario}"`;
                if (autorEl) autorEl.textContent = t.identificacion_cliente;
                if (cargoEl) cargoEl.textContent = t.cargo_o_tipo_cliente || 'Cliente Patrocinado';
            });
        }

        // B. Textos institucionales (Nosotros y Contacto)
        const cfg = JSON.parse(localStorage.getItem('ureta_config_cache') || 'null');
        if (cfg) {
            const mapaIds = {
                'homeTituloEstudio': cfg.nombre_estudio,
                'nosotrosTituloEstudio': cfg.nombre_estudio,
                'homeFraseInstitucional': cfg.frase_institucional,
                'nosotrosFraseInsignia': cfg.frase_institucional,
                'contactoDireccionTexto': cfg.direccion_fisica,
                'contactoTelefonoTexto': cfg.telefono_principal,
                'contactoCorreoTexto': cfg.correo_contacto,
                'contactoHorarioTexto': cfg.horario_atencion,
                'nosotrosHistoriaTexto': cfg.historia_institucional,
                'nosotrosMisionTexto': cfg.mision,
                'nosotrosVisionTexto': cfg.vision
            };
            Object.entries(mapaIds).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.textContent = val;
            });
        }

        // C. Bloques dinámicos exclusivos de index.html
        const areasActivas = obtenerAreasLegales().filter(a => a.activo);
        const homeAreasGrid = document.getElementById('homeAreasGrid');
        if (homeAreasGrid && areasActivas.length > 0) {
            const btnTotal = document.getElementById('btnVerTodasAreas');
            const badgeCant = document.getElementById('homeCantidadAreas');
            if (btnTotal) btnTotal.textContent = `Consultar todas nuestras especialidades (${areasActivas.length})`;
            if (badgeCant) badgeCant.textContent = `${areasActivas.length} Áreas de Práctica`;

            homeAreasGrid.innerHTML = areasActivas.slice(0, 6).map(a => `
                <article class="area-card">
                    <div class="area-card-img"><img src="${a.imagen}" alt="${a.nombre}"></div>
                    <div class="area-card-body">
                        <h3><i class="${a.icono || 'fa-solid fa-scale-balanced'}" style="color:var(--dorado); margin-right:6px;"></i> ${a.nombre}</h3>
                        <p>${a.resumen}</p>
                        <a href="area-detalle.html?area=${a.slug}" class="card-link">Conocer más <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            `).join('');
        }

        const homeStaffGrid = document.getElementById('homeStaffGrid');
        const staffActivo = obtenerStaff().filter(s => s.activo);
        if (homeStaffGrid && staffActivo.length > 0) {
            homeStaffGrid.innerHTML = staffActivo.slice(0, 3).map(s => `
                <div class="staff-card">
                    <div class="staff-img-wrapper"><img src="${s.foto}" alt="${s.nombre}"></div>
                    <div class="staff-info">
                        <span class="staff-role">${s.cargo}</span>
                        <h3>${s.nombre}</h3>
                        <p class="staff-specialty">${(s.especialidades || []).join(' • ')}</p>
                        <a href="staff.html" class="btn-staff-profile">Ver perfil profesional</a>
                    </div>
                </div>
            `).join('');
        }

        const homeBlogGrid = document.getElementById('homeBlogGrid');
        const blogPublicado = obtenerBlog().filter(b => b.estado === 'Publicado');
        if (homeBlogGrid && blogPublicado.length > 0) {
            homeBlogGrid.innerHTML = blogPublicado.slice(0, 3).map(b => `
                <article class="blog-card">
                    <div class="blog-card-img">
                        <span class="blog-category">${b.categoria}</span>
                        <img src="${b.imagen}" alt="${b.titulo}">
                    </div>
                    <div class="blog-card-body">
                        <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${b.fecha} • ${b.autor}</span>
                        <h3>${b.titulo}</h3>
                        <p>${b.subtitulo}</p>
                        <a href="blog.html" class="card-link">Leer artículo <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            `).join('');
        }
    }

    renderizarContenidoGlobalYHome();
    if (typeof sincronizarVistasSupabase === 'function' && supabaseEstaConfigurado()) {
        sincronizarVistasSupabase().then(renderizarContenidoGlobalYHome);
    }

    // =====================================================================
    // 2. CARRUSELES DE PORTADA Y TESTIMONIOS
    // =====================================================================
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let currentSlide = 0;

    function cambiarSlide(index) {
        if (slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }
    dots.forEach(dot => dot.addEventListener('click', () => cambiarSlide(parseInt(dot.dataset.slide))));
    if (slides.length > 1) setInterval(() => cambiarSlide((currentSlide + 1) % slides.length), 6000);

    const testSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prevTestimonio');
    const nextBtn = document.getElementById('nextTestimonio');
    let currentTest = 0;

    if (nextBtn && prevBtn && testSlides.length > 0) {
        nextBtn.addEventListener('click', () => {
            testSlides.forEach(s => s.classList.remove('active'));
            currentTest = (currentTest + 1) % testSlides.length;
            testSlides[currentTest].classList.add('active');
        });
        prevBtn.addEventListener('click', () => {
            testSlides.forEach(s => s.classList.remove('active'));
            currentTest = (currentTest - 1 + testSlides.length) % testSlides.length;
            testSlides[currentTest].classList.add('active');
        });
    }

    // =====================================================================
    // 3. CATÁLOGO Y DETALLE DE ESPECIALIDADES (areas.html / area-detalle.html)
    // =====================================================================
    const catalogoAreasContainer = document.getElementById('catalogoAreasContainer');
    if (catalogoAreasContainer) {
        const areas = obtenerAreasLegales().filter(a => a.activo);
        catalogoAreasContainer.innerHTML = areas.map(area => `
            <article class="area-card">
                <div class="area-card-img"><img src="${area.imagen}" alt="${area.nombre}"></div>
                <div class="area-card-body">
                    <h3><i class="${area.icono}" style="color: var(--dorado); margin-right: 6px;"></i> ${area.nombre}</h3>
                    <p>${area.resumen}</p>
                    <a href="area-detalle.html?area=${area.slug}" class="card-link">Conocer más <i class="fa-solid fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');
    }

    const areaNombreEl = document.getElementById('areaNombre');
    if (areaNombreEl) {
        const slugBuscado = new URLSearchParams(window.location.search).get('area') || 'derecho-civil';
        const areas = obtenerAreasLegales();
        const areaActual = areas.find(a => a.slug === slugBuscado) || areas[0];

        document.getElementById('pageAreaTitle').textContent = `${areaActual.nombre} | Estudio Jurídico Ureta & Asociados`;
        document.getElementById('areaBannerImg').style.backgroundImage = `url('${areaActual.imagen}')`;
        document.getElementById('areaIcono').className = areaActual.icono;
        areaNombreEl.textContent = areaActual.nombre;
        document.getElementById('areaResumen').textContent = areaActual.resumen;
        document.getElementById('areaDescripcion').textContent = areaActual.descripcion;
        document.getElementById('inputAreaSeleccionada').value = areaActual.nombre;
        document.getElementById('btnSolicitarAsesoriaArea').href = `contacto.html?area=${encodeURIComponent(areaActual.nombre)}`;

        document.getElementById('areaListaServicios').innerHTML = (areaActual.servicios || []).map(s => `<li><i class="fa-solid fa-check"></i> <span>${s}</span></li>`).join('');
        document.getElementById('areaListaSituaciones').innerHTML = (areaActual.situaciones || []).map(sit => `<li><i class="fa-solid fa-circle-dot"></i> <span>${sit}</span></li>`).join('');
        document.getElementById('sidebarAreasList').innerHTML = areas.filter(a => a.activo).map(a => `
            <li><a href="area-detalle.html?area=${a.slug}" class="${a.slug === areaActual.slug ? 'active' : ''}"><span>${a.nombre}</span><i class="fa-solid fa-chevron-right"></i></a></li>
        `).join('');

        const formRapido = document.getElementById('formConsultaRapidaArea');
        if (formRapido) {
            formRapido.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nueva = {
                    nombres: document.getElementById('rapidoNombre').value.trim(),
                    telefono: document.getElementById('rapidoTelefono').value.trim(),
                    correo: document.getElementById('rapidoCorreo').value.trim(),
                    empresa: '',
                    area: areaActual.nombre,
                    asunto: `Consulta desde especialidad: ${areaActual.nombre}`,
                    descripcion: document.getElementById('rapidoMensaje').value.trim(),
                    fecha: new Date().toLocaleString('es-PE'),
                    estado: 'Nueva'
                };
                await llamarProcedimiento('sp_registrar_solicitud_contacto', {
                    p_nombres: nueva.nombres, p_correo: nueva.correo, p_telefono: nueva.telefono,
                    p_empresa: '', p_area_nombre: nueva.area, p_asunto: nueva.asunto, p_descripcion: nueva.descripcion
                });
                const lista = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
                lista.unshift({ id: Date.now(), ...nueva });
                localStorage.setItem('ureta_contactos_db', JSON.stringify(lista));
                formRapido.reset();
                document.getElementById('msgConfirmacionArea').style.display = 'block';
            });
        }
    }

    // =====================================================================
    // 4. DIRECTORIO DE STAFF (staff.html - SIN "EXPERIENCIA PROFESIONAL")
    // =====================================================================
    const staffGrid = document.getElementById('staffDirectorioGrid');
    if (staffGrid) {
        const inputBuscar = document.getElementById('buscarAbogadoInput');
        const selectEsp = document.getElementById('filtroEspecialidadStaff');
        const modalStaff = document.getElementById('modalFichaAbogado');
        const modalContenido = document.getElementById('modalStaffContenido');

        function renderizarStaff() {
            const texto = (inputBuscar?.value || '').toLowerCase();
            const esp = selectEsp?.value || 'Todas';
            const filtrados = obtenerStaff().filter(ab => ab.activo &&
                (ab.nombre.toLowerCase().includes(texto) || ab.cargo.toLowerCase().includes(texto)) &&
                (esp === 'Todas' || (ab.especialidades || []).includes(esp))
            );

            staffGrid.innerHTML = filtrados.map(ab => `
                <div class="staff-card">
                    <div class="staff-img-wrapper"><img src="${ab.foto}" alt="${ab.nombre}"></div>
                    <div class="staff-info">
                        <span class="staff-role">${ab.cargo}</span>
                        <h3>${ab.nombre}</h3>
                        <div class="staff-tags">${(ab.especialidades || []).map(e => `<span class="staff-tag">${e}</span>`).join('')}</div>
                        <button class="btn-staff-profile" onclick="abrirFichaAbogado(${ab.id})">Ver ficha profesional</button>
                    </div>
                </div>
            `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">No se encontraron abogados con ese criterio.</p>`;
        }

        window.abrirFichaAbogado = function (id) {
            const ab = obtenerStaff().find(item => item.id === id);
            if (!ab) return;
            modalContenido.innerHTML = `
                <div><img src="${ab.foto}" alt="${ab.nombre}" class="modal-staff-img"></div>
                <div class="modal-staff-details">
                    <span class="staff-role">${ab.cargo}</span>
                    <h2>${ab.nombre}</h2>
                    <p style="font-size:0.86rem; color: var(--dorado-hover); font-weight:600;"><i class="fa-solid fa-id-card"></i> Colegiatura: ${ab.colegiatura}</p>
                    <div class="staff-detail-block"><h4>Especialidades</h4><p>${(ab.especialidades || []).join(' • ')}</p></div>
                    <div class="staff-detail-block"><h4>Formación Académica</h4><p>${ab.formacion}</p></div>
                    <div class="staff-detail-block"><h4>Cursos y Especializaciones</h4><p>${ab.cursos}</p></div>
                    <div class="staff-detail-block"><h4>Biografía</h4><p>${ab.biografia}</p></div>
                    ${ab.correo ? `<div class="staff-detail-block"><a href="mailto:${ab.correo}" class="btn btn-gold" style="margin-top:8px;"><i class="fa-solid fa-envelope"></i> ${ab.correo}</a></div>` : ''}
                </div>
            `;
            modalStaff.classList.add('open');
        };

        document.getElementById('cerrarModalStaff')?.addEventListener('click', () => modalStaff.classList.remove('open'));
        inputBuscar?.addEventListener('input', renderizarStaff);
        selectEsp?.addEventListener('change', renderizarStaff);
        renderizarStaff();
    }

    // =====================================================================
    // 5. ARTÍCULOS JURÍDICOS (blog.html)
    // =====================================================================
    const blogGrid = document.getElementById('blogListadoGrid');
    if (blogGrid) {
        const inputBuscarBlog = document.getElementById('buscarBlogInput');
        const selectCatBlog = document.getElementById('filtroCategoriaBlog');
        const selectTipoBlog = document.getElementById('filtroTipoBlog');
        const destacadoContainer = document.getElementById('blogDestacadoContainer');
        const modalBlog = document.getElementById('modalArticuloBlog');
        const modalBlogContenido = document.getElementById('modalBlogContenido');

        function renderizarBlog() {
            const articulos = obtenerBlog().filter(p => p.estado === 'Publicado');
            const dest = articulos.find(p => p.destacado) || articulos[0];
            if (dest && destacadoContainer) {
                destacadoContainer.innerHTML = `
                    <div class="featured-post-card">
                        <div class="featured-post-img" style="background-image: url('${dest.imagen}');"></div>
                        <div class="featured-post-body">
                            <div><span class="badge-tipo">★ ARTÍCULO DESTACADO</span></div>
                            <h2>${dest.titulo}</h2>
                            <p>${dest.subtitulo}</p>
                            <p style="font-size: 0.82rem; color: var(--dorado);">Por: ${dest.autor} | Fecha: ${dest.fecha}</p>
                            <div><button class="btn btn-gold" onclick="abrirArticuloBlog(${dest.id})">Leer artículo completo</button></div>
                        </div>
                    </div>
                `;
            }

            const q = (inputBuscarBlog?.value || '').toLowerCase();
            const cat = selectCatBlog?.value || 'Todas';
            const tipo = selectTipoBlog?.value || 'Todos';

            const filtrados = articulos.filter(p =>
                (p.titulo.toLowerCase().includes(q) || p.subtitulo.toLowerCase().includes(q) || p.autor.toLowerCase().includes(q)) &&
                (cat === 'Todas' || p.categoria === cat) &&
                (tipo === 'Todos' || p.tipo === tipo)
            );

            blogGrid.innerHTML = filtrados.map(p => `
                <article class="blog-card">
                    <div class="blog-card-img">
                        <span class="blog-category">${p.categoria}</span>
                        <img src="${p.imagen}" alt="${p.titulo}">
                    </div>
                    <div class="blog-card-body">
                        <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${p.fecha}</span>
                        <h3>${p.titulo}</h3>
                        <p>${p.subtitulo}</p>
                        <button onclick="abrirArticuloBlog(${p.id})" class="card-link" style="background:none; border:none; cursor:pointer; padding:0;">Leer artículo <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </article>
            `).join('');
        }

        window.abrirArticuloBlog = function (id) {
            const art = obtenerBlog().find(a => a.id === id);
            if (!art) return;
            modalBlogContenido.innerHTML = `
                <span class="badge-tipo">${art.categoria}</span>
                <h2 style="font-family: var(--fuente-titulos); font-size: 2rem; margin: 8px 0 10px;">${art.titulo}</h2>
                <p style="font-size: 0.86rem; color: var(--gris-texto); margin-bottom: 20px;">Por: <strong>${art.autor}</strong> | ${art.fecha}</p>
                <img src="${art.imagen}" alt="${art.titulo}" style="width:100%; height:300px; object-fit:cover; border-radius:4px; margin-bottom:24px;">
                <div class="article-content-body">${art.contenido}</div>
                <div class="detail-box" style="margin-top: 28px;">
                    <h3><i class="fa-regular fa-comments"></i> Dejar un comentario</h3>
                    <form onsubmit="enviarComentarioBlog(event, ${art.id})">
                        <div class="form-row-2">
                            <div class="form-group"><input type="text" id="comNombreVisitante" placeholder="Su nombre *" required></div>
                            <div class="form-group"><input type="email" id="comCorreoVisitante" placeholder="Su correo electrónico *" required></div>
                        </div>
                        <div class="form-group"><textarea id="comTextoVisitante" rows="2" placeholder="Escriba su comentario *" required></textarea></div>
                        <button type="submit" class="btn btn-primary-dark">Enviar comentario</button>
                        <p id="msgComentarioEnviado" style="display:none; color:#238d41; font-size:0.84rem; margin-top:8px; font-weight:600;">✓ Comentario enviado para aprobación.</p>
                    </form>
                </div>
            `;
            modalBlog.classList.add('open');
        };

        window.enviarComentarioBlog = async function (e, pubId) {
            e.preventDefault();
            await llamarProcedimiento('sp_agregar_comentario_blog', {
                p_publicacion_id: pubId,
                p_nombre: document.getElementById('comNombreVisitante').value.trim(),
                p_correo: document.getElementById('comCorreoVisitante').value.trim(),
                p_comentario: document.getElementById('comTextoVisitante').value.trim()
            });
            e.target.reset();
            document.getElementById('msgComentarioEnviado').style.display = 'block';
        };

        document.getElementById('cerrarModalBlog')?.addEventListener('click', () => modalBlog.classList.remove('open'));
        inputBuscarBlog?.addEventListener('input', renderizarBlog);
        selectCatBlog?.addEventListener('change', renderizarBlog);
        selectTipoBlog?.addEventListener('change', renderizarBlog);
        renderizarBlog();
    }

    // =====================================================================
    // 6. EVENTOS ACADÉMICOS CON LINK EDITABLE DE FORMS (eventos.html)
    // =====================================================================
    const eventosGrid = document.getElementById('eventosListadoGrid');
    if (eventosGrid) {
        (async () => {
            const destContainer = document.getElementById('eventoDestacadoContainer');
            const inputBuscar = document.getElementById('buscarEventoInput');
            const selectMod = document.getElementById('filtroModalidadEvento');
            const modal = document.getElementById('modalDetalleEvento');
            const modalBody = document.getElementById('modalEventoContenido');
            const eventos = await consultarVistaSupabase('eventos_academicos', '?select=*&estado=neq.Oculto&order=evento_id.desc') || [];

            window.abrirModalEvento = (id) => {
                const ev = eventos.find(e => e.evento_id === id);
                if (!ev) return;
                modalBody.innerHTML = `
                    <img src="${ev.imagen_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}" style="width:100%; max-height:320px; object-fit:cover; border-radius:6px; margin-bottom:20px;">
                    <span class="section-tag">${ev.categoria} • ${ev.modalidad}</span>
                    <h2 style="font-family:var(--fuente-titulos); color:#123c2a; margin:8px 0 12px;">${ev.titulo}</h2>
                    <div style="background:#e6e0db; padding:14px 18px; border-radius:6px; margin-bottom:18px; font-size:0.9rem;">
                        <p style="margin-bottom:6px;"><strong>Fecha:</strong> ${ev.fecha_evento || 'Por confirmar'}</p>
                        <p style="margin-bottom:6px;"><strong>Hora y Lugar:</strong> ${ev.hora_lugar || 'Sede Arequipa / Virtual'}</p>
                        <p style="margin:0;"><strong>Ponente(s):</strong> ${ev.ponente}</p>
                    </div>
                    <div style="line-height:1.8; margin-bottom:24px;">${ev.descripcion_html || ev.subtitulo}</div>
                    ${ev.link_inscripcion ? `<a href="${ev.link_inscripcion}" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="width:100%; justify-content:center; padding:15px;"><i class="fa-solid fa-clipboard-check"></i> Inscribirse en el Formulario Oficial (Forms)</a>` : ''}
                `;
                modal.classList.add('active');
            };

            document.getElementById('cerrarModalEvento')?.addEventListener('click', () => modal.classList.remove('active'));

            function renderEventos() {
                const q = (inputBuscar?.value || '').toLowerCase();
                const mod = selectMod?.value || 'Todas';
                const dest = eventos.find(e => e.destacado) || eventos[0];

                if (dest && destContainer) {
                    destContainer.innerHTML = `
                        <div class="featured-post-card" style="display:grid; grid-template-columns:1fr 1.2fr; gap:28px; background:#fff; border-radius:8px; overflow:hidden; margin-bottom:32px; border:1px solid #a8ada8;">
                            <img src="${dest.imagen_url}" alt="${dest.titulo}" style="width:100%; height:100%; min-height:280px; object-fit:cover;">
                            <div style="padding:32px;">
                                <span class="section-tag">EVENTO DESTACADO • ${dest.categoria}</span>
                                <h2 style="font-family:var(--fuente-titulos); color:#123c2a; margin:8px 0 12px;">${dest.titulo}</h2>
                                <p style="margin-bottom:14px;">${dest.subtitulo}</p>
                                <p style="font-size:0.86rem; color:#238d41; font-weight:600; margin-bottom:20px;"><i class="fa-regular fa-calendar"></i> ${dest.fecha_evento} | ${dest.hora_lugar}</p>
                                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                                    <button onclick="abrirModalEvento(${dest.evento_id})" class="btn btn-primary-dark">Información del evento</button>
                                    ${dest.link_inscripcion ? `<a href="${dest.link_inscripcion}" target="_blank" class="btn btn-gold">Inscribirme (Forms)</a>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }

                const filtrados = eventos.filter(e =>
                    (mod === 'Todas' || (e.modalidad || '').includes(mod)) &&
                    (e.titulo.toLowerCase().includes(q) || (e.subtitulo || '').toLowerCase().includes(q))
                );

                eventosGrid.innerHTML = filtrados.map(ev => `
                    <article class="blog-card">
                        <div class="blog-card-img">
                            <span class="blog-category">${ev.categoria}</span>
                            <img src="${ev.imagen_url}" alt="${ev.titulo}">
                        </div>
                        <div class="blog-card-body">
                            <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${ev.fecha_evento || ''} • ${ev.modalidad}</span>
                            <h3>${ev.titulo}</h3>
                            <p>${ev.subtitulo}</p>
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:14px; flex-wrap:wrap;">
                                <a href="javascript:void(0)" onclick="abrirModalEvento(${ev.evento_id})" class="card-link">Información <i class="fa-solid fa-arrow-right"></i></a>
                                ${ev.link_inscripcion ? `<a href="${ev.link_inscripcion}" target="_blank" class="btn btn-gold" style="padding:7px 14px; font-size:0.8rem;">Inscribirme</a>` : ''}
                            </div>
                        </div>
                    </article>
                `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">Próximamente publicaremos nuevos eventos académicos.</p>`;
            }

            inputBuscar?.addEventListener('input', renderEventos);
            selectMod?.addEventListener('change', renderEventos);
            renderEventos();
        })();
    }

    // =====================================================================
    // 7. CONTÁCTANOS (contacto.html)
    // =====================================================================
    const formContacto = document.getElementById('formContactoPrincipal');
    if (formContacto) {
        const areaPre = new URLSearchParams(window.location.search).get('area');
        if (areaPre && document.getElementById('conAreaInteres')) {
            document.getElementById('conAreaInteres').value = areaPre;
        }

        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const datos = {
                nombres: document.getElementById('conNombres').value.trim(),
                correo: document.getElementById('conCorreo').value.trim(),
                telefono: document.getElementById('conTelefono').value.trim(),
                empresa: document.getElementById('conEmpresa').value.trim(),
                area: document.getElementById('conAreaInteres').value,
                asunto: document.getElementById('conAsunto').value.trim(),
                descripcion: document.getElementById('conDescripcion').value.trim(),
                fecha: new Date().toLocaleString('es-PE'),
                estado: 'Nueva'
            };
            await llamarProcedimiento('sp_registrar_solicitud_contacto', {
                p_nombres: datos.nombres, p_correo: datos.correo, p_telefono: datos.telefono,
                p_empresa: datos.empresa, p_area_nombre: datos.area, p_asunto: datos.asunto, p_descripcion: datos.descripcion
            });
            const lista = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
            lista.unshift({ id: Date.now(), ...datos });
            localStorage.setItem('ureta_contactos_db', JSON.stringify(lista));
            formContacto.reset();
            document.getElementById('alertaExitoContacto').style.display = 'flex';
        });
    }

    // =====================================================================
    // 8. TRABAJA CON NOSOTROS + "DE PRACTICANTE A ABOGADO"
    // =====================================================================
    const gridHistorias = document.getElementById('historiasCarreraGrid');
    if (gridHistorias) {
        consultarVistaSupabase('historias_carrera', '?select=*&activo=eq.true&order=orden.asc').then(historias => {
            if (!historias) return;
            gridHistorias.innerHTML = historias.map(h => `
                <article class="story-card">
                    <div class="story-photo-wrap">
                        <img src="${h.foto_url}" alt="${h.nombre_completo}">
                        <span class="story-badge-start"><i class="fa-solid fa-seedling"></i> ${h.etapa_inicio}</span>
                    </div>
                    <div class="story-body">
                        <span class="story-role-now">${h.cargo_actual}</span>
                        <h3>${h.nombre_completo}</h3>
                        <p>"${h.historia}"</p>
                    </div>
                </article>
            `).join('');
        });
    }

    const vacantesGrid = document.getElementById('vacantesListadoGrid');
    if (vacantesGrid) {
        const selectPuesto = document.getElementById('postPuestoSelect');
        const vacantesActivas = obtenerVacantes().filter(v => v.activa);

        vacantesActivas.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.puesto;
            opt.textContent = `${v.puesto} (${v.area})`;
            selectPuesto?.appendChild(opt);
        });

        vacantesGrid.innerHTML = vacantesActivas.map(v => `
            <article class="vacancy-card">
                <span class="staff-role">${v.area}</span>
                <h3 style="font-family: var(--fuente-titulos); font-size: 1.35rem; margin: 6px 0;">${v.puesto}</h3>
                <div class="vacancy-meta">
                    <span><i class="fa-solid fa-building-user"></i> ${v.modalidad}</span>
                    <span><i class="fa-solid fa-hourglass-half"></i> Cierre: ${v.fechaLimite}</span>
                </div>
                <p style="font-size: 0.9rem; margin-bottom: 14px;">${v.descripcion}</p>
                <a href="#bloqueFormularioPostulacion" class="btn btn-primary-dark" onclick="document.getElementById('postPuestoSelect').value='${v.puesto}'">Postular a esta convocatoria</a>
            </article>
        `).join('') || `<p>Actualmente no hay convocatorias abiertas, pero puedes enviarnos tu CV de forma espontánea.</p>`;

        const formPostulacion = document.getElementById('formPostulacionTalento');
        if (formPostulacion) {
            formPostulacion.addEventListener('submit', async (e) => {
                e.preventDefault();
                const errorCv = document.getElementById('errorArchivoCv');
                errorCv.style.display = 'none';
                const archivo = document.getElementById('postArchivoCv').files[0];
                if (!archivo) return;

                if (!archivo.name.toLowerCase().endsWith('.pdf') || archivo.size > 5 * 1024 * 1024) {
                    errorCv.textContent = 'Error: Solo se admite formato PDF menor a 5 MB.';
                    errorCv.style.display = 'block';
                    return;
                }

                const datos = {
                    nombres: document.getElementById('postNombres').value.trim(),
                    documento: document.getElementById('postDocumento').value.trim(),
                    correo: document.getElementById('postCorreo').value.trim(),
                    telefono: document.getElementById('postTelefono').value.trim(),
                    profesion: document.getElementById('postProfesion').value.trim(),
                    puesto: selectPuesto.value,
                    experiencia: document.getElementById('postExperiencia').value.trim(),
                    mensaje: document.getElementById('postMensaje').value.trim()
                };
                await subirCvPdfASupabase(archivo, datos);
                formPostulacion.reset();
                document.getElementById('alertaExitoPostulacion').style.display = 'flex';
            });
        }
    }
});