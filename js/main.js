document.addEventListener('DOMContentLoaded', () => {
    
    // Esperar sincronización inicial desde las Vistas de Supabase si está configurado
    if (typeof sincronizarVistasSupabase === 'function' && supabaseEstaConfigurado()) {
        sincronizarVistasSupabase();
    }

    // =========================================================
    // 1. MENÚ HAMBURGUESA PARA CELULARES Y TABLETS
    // =========================================================
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const areasDropdown = document.getElementById('areasDropdown');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    if (areasDropdown) {
        const toggleLink = areasDropdown.querySelector('.dropdown-toggle');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    areasDropdown.classList.toggle('open');
                }
            });
        }
    }

    // =========================================================
    // 2. CARRUSEL SUAVE DE PORTADA (HERO SLIDER)
    // =========================================================
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

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-slide'));
            cambiarSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(() => {
            let next = (currentSlide + 1) % slides.length;
            cambiarSlide(next);
        }, 6000);
    }

    // =========================================================
    // 3. CARRUSEL DE TESTIMONIOS DE CLIENTES
    // =========================================================
    const testSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prevTestimonio');
    const nextBtn = document.getElementById('nextTestimonio');
    let currentTest = 0;

    function mostrarTestimonio(index) {
        if (testSlides.length === 0) return;
        testSlides.forEach(s => s.classList.remove('active'));
        testSlides[index].classList.add('active');
    }

    if (nextBtn && prevBtn && testSlides.length > 0) {
        nextBtn.addEventListener('click', () => {
            currentTest = (currentTest + 1) % testSlides.length;
            mostrarTestimonio(currentTest);
        });

        prevBtn.addEventListener('click', () => {
            currentTest = (currentTest - 1 + testSlides.length) % testSlides.length;
            mostrarTestimonio(currentTest);
        });
    }

    // =========================================================
    // 4. CATÁLOGO DE LAS 13 ÁREAS LEGALES (areas.html)
    // =========================================================
    const catalogoAreasContainer = document.getElementById('catalogoAreasContainer');
    if (catalogoAreasContainer && typeof obtenerAreasLegales === 'function') {
        const areas = obtenerAreasLegales().filter(a => a.activo);
        catalogoAreasContainer.innerHTML = areas.map(area => `
            <article class="area-card">
                <div class="area-card-img">
                    <img src="${area.imagen}" alt="${area.nombre}">
                </div>
                <div class="area-card-body">
                    <h3><i class="${area.icono}" style="color: var(--dorado); margin-right: 6px;"></i> ${area.nombre}</h3>
                    <p>${area.resumen}</p>
                    <a href="area-detalle.html?area=${area.slug}" class="card-link">
                        Conocer más <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `).join('');
    }

    // =========================================================
    // 5. PÁGINA INDIVIDUAL DE ESPECIALIDAD (area-detalle.html)
    // =========================================================
    const areaNombreEl = document.getElementById('areaNombre');
    if (areaNombreEl && typeof obtenerAreasLegales === 'function') {
        const params = new URLSearchParams(window.location.search);
        const slugBuscado = params.get('area') || 'derecho-corporativo';
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

        document.getElementById('areaListaServicios').innerHTML = (areaActual.servicios || []).map(s => `
            <li><i class="fa-solid fa-check"></i> <span>${s}</span></li>
        `).join('');

        document.getElementById('areaListaSituaciones').innerHTML = (areaActual.situaciones || []).map(sit => `
            <li><i class="fa-solid fa-circle-dot"></i> <span>${sit}</span></li>
        `).join('');

        document.getElementById('sidebarAreasList').innerHTML = areas.filter(a => a.activo).map(a => `
            <li>
                <a href="area-detalle.html?area=${a.slug}" class="${a.slug === areaActual.slug ? 'active' : ''}">
                    <span>${a.nombre}</span>
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>
        `).join('');

        // Formulario rápido de la especialidad -> Llama a sp_registrar_solicitud_contacto
        const formRapido = document.getElementById('formConsultaRapidaArea');
        if (formRapido) {
            formRapido.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nuevaConsulta = {
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

                if (typeof llamarProcedimiento === 'function') {
                    await llamarProcedimiento('sp_registrar_solicitud_contacto', {
                        p_nombres: nuevaConsulta.nombres,
                        p_correo: nuevaConsulta.correo,
                        p_telefono: nuevaConsulta.telefono,
                        p_empresa: '',
                        p_area_nombre: nuevaConsulta.area,
                        p_asunto: nuevaConsulta.asunto,
                        p_descripcion: nuevaConsulta.descripcion
                    });
                }

                const solicitudes = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
                solicitudes.unshift({ id: Date.now(), ...nuevaConsulta });
                localStorage.setItem('ureta_contactos_db', JSON.stringify(solicitudes));

                formRapido.reset();
                document.getElementById('msgConfirmacionArea').style.display = 'block';
            });
        }
    }

    // =========================================================
    // 6. NUESTRO STAFF (BUSCADOR, FILTRO Y FICHA INDIVIDUAL)
    // =========================================================
    const staffGrid = document.getElementById('staffDirectorioGrid');
    if (staffGrid && typeof obtenerStaff === 'function') {
        const inputBuscar = document.getElementById('buscarAbogadoInput');
        const selectEsp = document.getElementById('filtroEspecialidadStaff');
        const modalStaff = document.getElementById('modalFichaAbogado');
        const modalContenido = document.getElementById('modalStaffContenido');

        function renderizarStaff() {
            const texto = inputBuscar.value.toLowerCase();
            const especialidad = selectEsp.value;
            const abogados = obtenerStaff().filter(ab => ab.activo);

            const filtrados = abogados.filter(ab => {
                const coincideNombre = ab.nombre.toLowerCase().includes(texto) || ab.cargo.toLowerCase().includes(texto);
                const coincideEsp = especialidad === 'Todas' || (ab.especialidades || []).includes(especialidad);
                return coincideNombre && coincideEsp;
            });

            if (filtrados.length === 0) {
                staffGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 30px;">No se encontraron abogados con ese criterio de búsqueda.</p>`;
                return;
            }

            staffGrid.innerHTML = filtrados.map(ab => `
                <div class="staff-card">
                    <div class="staff-img-wrapper">
                        <img src="${ab.foto}" alt="${ab.nombre}">
                    </div>
                    <div class="staff-info">
                        <span class="staff-role">${ab.cargo}</span>
                        <h3>${ab.nombre}</h3>
                        <div class="staff-tags">
                            ${(ab.especialidades || []).map(e => `<span class="staff-tag">${e}</span>`).join('')}
                        </div>
                        <button class="btn-staff-profile" onclick="abrirFichaAbogado(${ab.id})">
                            Ver ficha profesional
                        </button>
                    </div>
                </div>
            `).join('');
        }

        window.abrirFichaAbogado = function(id) {
            const ab = obtenerStaff().find(item => item.id === id);
            if (!ab) return;
            modalContenido.innerHTML = `
                <div>
                    <img src="${ab.foto}" alt="${ab.nombre}" class="modal-staff-img">
                </div>
                <div class="modal-staff-details">
                    <span class="staff-role">${ab.cargo}</span>
                    <h2>${ab.nombre}</h2>
                    <p style="font-size:0.86rem; color: var(--dorado-hover); font-weight:600;">
                        <i class="fa-solid fa-id-card"></i> Colegiatura: ${ab.colegiatura}
                    </p>
                    <div class="staff-detail-block">
                        <h4>Especialidades</h4>
                        <p>${(ab.especialidades || []).join(' • ')}</p>
                    </div>
                    <div class="staff-detail-block">
                        <h4>Formación Académica</h4>
                        <p>${ab.formacion}</p>
                    </div>
                    <div class="staff-detail-block">
                    </div>
                    <div class="staff-detail-block">
                        <h4>Cursos y Especializaciones</h4>
                        <p>${ab.cursos}</p>
                    </div>
                    <div class="staff-detail-block">
                        <h4>Biografía</h4>
                        <p>${ab.biografia}</p>
                    </div>
                    ${ab.correo ? `
                    <div class="staff-detail-block">
                        <a href="mailto:${ab.correo}" class="btn btn-gold" style="margin-top:8px;">
                            <i class="fa-solid fa-envelope"></i> ${ab.correo}
                        </a>
                    </div>` : ''}
                </div>
            `;
            modalStaff.classList.add('open');
        };

        document.getElementById('cerrarModalStaff').addEventListener('click', () => {
            modalStaff.classList.remove('open');
        });

        inputBuscar.addEventListener('input', renderizarStaff);
        selectEsp.addEventListener('change', renderizarStaff);
        renderizarStaff();
    }

    // =========================================================
    // 7. BLOG / ACTUALIDAD JURÍDICA + COMENTARIOS DE LECTORES
    // =========================================================
    const blogGrid = document.getElementById('blogListadoGrid');
    if (blogGrid && typeof obtenerBlog === 'function') {
        const inputBuscarBlog = document.getElementById('buscarBlogInput');
        const selectCatBlog = document.getElementById('filtroCategoriaBlog');
        const selectTipoBlog = document.getElementById('filtroTipoBlog');
        const destacadoContainer = document.getElementById('blogDestacadoContainer');
        const modalBlog = document.getElementById('modalArticuloBlog');
        const modalBlogContenido = document.getElementById('modalBlogContenido');

        function etiquetaTipo(tipo) {
            if (tipo === 'ArticuloPropio') return 'Artículo Propio';
            if (tipo === 'AnalisisJuridico') return 'Análisis Jurídico';
            return 'Noticia Externa';
        }

        function renderizarBlog() {
            const articulos = obtenerBlog().filter(p => p.estado === 'Publicado');
            const destacado = articulos.find(p => p.destacado) || articulos[0];

            if (destacado && destacadoContainer) {
                destacadoContainer.innerHTML = `
                    <div class="featured-post-card">
                        <div class="featured-post-img" style="background-image: url('${destacado.imagen}');"></div>
                        <div class="featured-post-body">
                            <div><span class="badge-tipo">★ PUBLICACIÓN DESTACADA • ${etiquetaTipo(destacado.tipo)}</span></div>
                            <h2>${destacado.titulo}</h2>
                            <p>${destacado.subtitulo}</p>
                            <p style="font-size: 0.82rem; color: var(--dorado);">Por: ${destacado.autor} | Fecha: ${destacado.fecha}</p>
                            <div>
                                <button class="btn btn-gold" onclick="abrirArticuloBlog(${destacado.id})">Leer publicación completa</button>
                            </div>
                        </div>
                    </div>
                `;
            }

            const texto = inputBuscarBlog.value.toLowerCase();
            const cat = selectCatBlog.value;
            const tipo = selectTipoBlog.value;

            const filtrados = articulos.filter(p => {
                const coincideTexto = p.titulo.toLowerCase().includes(texto) || p.subtitulo.toLowerCase().includes(texto) || p.autor.toLowerCase().includes(texto);
                const coincideCat = cat === 'Todas' || p.categoria === cat;
                const coincideTipo = tipo === 'Todos' || p.tipo === tipo;
                return coincideTexto && coincideCat && coincideTipo;
            });

            blogGrid.innerHTML = filtrados.map(p => `
                <article class="blog-card">
                    <div class="blog-card-img">
                        <span class="blog-category">${p.categoria}</span>
                        <img src="${p.imagen}" alt="${p.titulo}">
                    </div>
                    <div class="blog-card-body">
                        <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${p.fecha} • <strong>${etiquetaTipo(p.tipo)}</strong></span>
                        <h3>${p.titulo}</h3>
                        <p>${p.subtitulo}</p>
                        <button onclick="abrirArticuloBlog(${p.id})" class="card-link" style="background:none; border:none; cursor:pointer; padding:0;">
                            Leer artículo <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </article>
            `).join('');
        }

        window.abrirArticuloBlog = function(id) {
            const art = obtenerBlog().find(a => a.id === id);
            if (!art) return;
            modalBlogContenido.innerHTML = `
                <span class="badge-tipo">${art.categoria} • ${etiquetaTipo(art.tipo)}</span>
                <h2 style="font-family: var(--fuente-titulos); font-size: 2rem; margin: 8px 0 10px;">${art.titulo}</h2>
                <p style="font-size: 0.86rem; color: var(--gris-texto); margin-bottom: 20px;">
                    <i class="fa-solid fa-user-pen" style="color:var(--dorado);"></i> Autor: <strong>${art.autor}</strong>  | 
                    <i class="fa-regular fa-calendar" style="color:var(--dorado);"></i> Publicado: ${art.fecha}
                </p>
                <img src="${art.imagen}" alt="${art.titulo}" style="width:100%; height:300px; object-fit:cover; border-radius:4px; margin-bottom:24px;">
                <div class="article-content-body">
                    ${art.contenido}
                </div>
                ${art.fuenteUrl ? `
                <div class="detail-box highlight-box" style="margin-top: 24px;">
                    <h3><i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente Externa Oficial</h3>
                    <p style="margin-bottom:10px;">Medio: <strong>${art.fuenteNombre || 'Fuente Oficial'}</strong></p>
                    <a href="${art.fuenteUrl}" target="_blank" class="btn btn-primary-dark">Visitar fuente original</a>
                </div>` : ''}

                <!-- Formulario para dejar comentario en el artículo (sp_agregar_comentario_blog) -->
                <div class="detail-box" style="margin-top: 28px;">
                    <h3><i class="fa-regular fa-comments"></i> Dejar un comentario sobre este artículo</h3>
                    <form onsubmit="enviarComentarioBlog(event, ${art.id})">
                        <div class="form-row-2">
                            <div class="form-group">
                                <input type="text" id="comNombreVisitante" placeholder="Su nombre *" required>
                            </div>
                            <div class="form-group">
                                <input type="email" id="comCorreoVisitante" placeholder="Su correo electrónico *" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <textarea id="comTextoVisitante" rows="2" placeholder="Escriba su comentario o apreciación jurídica *" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary-dark" style="padding: 10px 20px;">Enviar comentario para moderación</button>
                        <p id="msgComentarioEnviado" style="display:none; color:#10b981; font-size:0.84rem; margin-top:8px; font-weight:600;">
                            ✓ Comentario registrado. Será visible tras la aprobación del administrador.
                        </p>
                    </form>
                </div>

                <div class="share-bar">
                    <span style="font-size: 0.85rem; font-weight: 700;">Compartir artículo:</span>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(art.titulo)}" target="_blank" class="btn btn-whatsapp" style="padding: 8px 14px; font-size:0.8rem;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </a>
                </div>
            `;
            modalBlog.classList.add('open');
        };

        window.enviarComentarioBlog = async function(e, publicacionId) {
            e.preventDefault();
            const nombre = document.getElementById('comNombreVisitante').value.trim();
            const correo = document.getElementById('comCorreoVisitante').value.trim();
            const comentario = document.getElementById('comTextoVisitante').value.trim();

            if (typeof llamarProcedimiento === 'function') {
                await llamarProcedimiento('sp_agregar_comentario_blog', {
                    p_publicacion_id: publicacionId,
                    p_nombre: nombre,
                    p_correo: correo,
                    p_comentario: comentario
                });
            }
            e.target.reset();
            document.getElementById('msgComentarioEnviado').style.display = 'block';
        };

        document.getElementById('cerrarModalBlog').addEventListener('click', () => {
            modalBlog.classList.remove('open');
        });

        inputBuscarBlog.addEventListener('input', renderizarBlog);
        selectCatBlog.addEventListener('change', renderizarBlog);
        selectTipoBlog.addEventListener('change', renderizarBlog);
        renderizarBlog();
    }

    // =========================================================
    // 8. CONTÁCTANOS -> EJECUTA sp_registrar_solicitud_contacto
    // =========================================================
    const formContacto = document.getElementById('formContactoPrincipal');
    if (formContacto) {
        const paramsUrl = new URLSearchParams(window.location.search);
        const areaPre = paramsUrl.get('area');
        if (areaPre) {
            document.getElementById('conAreaInteres').value = areaPre;
        }

        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const datosConsulta = {
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

            // 1. Llamar al Procedimiento Almacenado en Supabase
            if (typeof llamarProcedimiento === 'function') {
                await llamarProcedimiento('sp_registrar_solicitud_contacto', {
                    p_nombres: datosConsulta.nombres,
                    p_correo: datosConsulta.correo,
                    p_telefono: datosConsulta.telefono,
                    p_empresa: datosConsulta.empresa,
                    p_area_nombre: datosConsulta.area,
                    p_asunto: datosConsulta.asunto,
                    p_descripcion: datosConsulta.descripcion
                });
            }

            // 2. Guardar respaldo local inmediato
            const solicitudes = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
            solicitudes.unshift({ id: Date.now(), ...datosConsulta });
            localStorage.setItem('ureta_contactos_db', JSON.stringify(solicitudes));

            formContacto.reset();
            document.getElementById('alertaExitoContacto').style.display = 'flex';
        });
    }

    // =========================================================
    // 9. TRABAJA CON NOSOTROS -> SUBE PDF A SUPABASE STORAGE Y LLAMA A sp_registrar_postulacion_con_cv
    // =========================================================
    const vacantesGrid = document.getElementById('vacantesListadoGrid');
    if (vacantesGrid && typeof obtenerVacantes === 'function') {
        const selectPuesto = document.getElementById('postPuestoSelect');
        const vacantesActivas = obtenerVacantes().filter(v => v.activa);

        vacantesActivas.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.puesto;
            opt.textContent = `${v.puesto} (${v.area})`;
            selectPuesto.appendChild(opt);
        });

        if (vacantesActivas.length === 0) {
            vacantesGrid.innerHTML = `<p>Actualmente no hay convocatorias abiertas, pero puedes enviarnos tu CV mediante una Postulación Espontánea.</p>`;
        } else {
            vacantesGrid.innerHTML = vacantesActivas.map(v => `
                <article class="vacancy-card">
                    <span class="staff-role">${v.area}</span>
                    <h3 style="font-family: var(--fuente-titulos); font-size: 1.35rem; margin: 6px 0;">${v.puesto}</h3>
                    <div class="vacancy-meta">
                        <span><i class="fa-solid fa-building-user"></i> ${v.modalidad}</span>
                        <span><i class="fa-regular fa-calendar"></i> Publicado: ${v.fechaPublicacion}</span>
                        <span><i class="fa-solid fa-hourglass-half"></i> Cierre: ${v.fechaLimite}</span>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--gris-texto); margin-bottom: 14px;">${v.descripcion}</p>
                    <h4 style="font-size: 0.85rem; margin-bottom: 8px;">Requisitos principales:</h4>
                    <ul class="check-list" style="margin-bottom: 20px;">
                        ${(v.requisitos || []).map(r => `<li><i class="fa-solid fa-check"></i> <span>${r}</span></li>`).join('')}
                    </ul>
                    <a href="#bloqueFormularioPostulacion" class="btn btn-primary-dark" onclick="postularAVacante('${v.puesto}')">
                        Postular a esta vacante
                    </a>
                </article>
            `).join('');
        }

        window.postularAVacante = function(nombrePuesto) {
            selectPuesto.value = nombrePuesto;
        };

        window.seleccionarPostulacionEspontanea = function() {
            selectPuesto.value = 'Postulación Espontánea';
        };

        const formPostulacion = document.getElementById('formPostulacionTalento');
        const inputCv = document.getElementById('postArchivoCv');
        const errorCv = document.getElementById('errorArchivoCv');

        formPostulacion.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorCv.style.display = 'none';

            const archivo = inputCv.files[0];
            if (!archivo) return;

            const esPdf = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
            const maxBytes = 5 * 1024 * 1024;

            if (!esPdf) {
                errorCv.textContent = 'Error: Por seguridad, solo se admiten archivos en formato PDF (.pdf).';
                errorCv.style.display = 'block';
                return;
            }
            if (archivo.size > maxBytes) {
                errorCv.textContent = 'Error: El archivo PDF supera el límite máximo permitido de 5 MB.';
                errorCv.style.display = 'block';
                return;
            }

            const datosPostulante = {
                nombres: document.getElementById('postNombres').value.trim(),
                documento: document.getElementById('postDocumento').value.trim(),
                correo: document.getElementById('postCorreo').value.trim(),
                telefono: document.getElementById('postTelefono').value.trim(),
                profesion: document.getElementById('postProfesion').value.trim(),
                puesto: selectPuesto.value,
                experiencia: document.getElementById('postExperiencia').value.trim(),
                mensaje: document.getElementById('postMensaje').value.trim()
            };

            // 1. Subir el archivo PDF físico al Bucket 'cvs_postulantes' y llamar a sp_registrar_postulacion_con_cv
            if (typeof subirCvPdfASupabase === 'function') {
                await subirCvPdfASupabase(archivo, datosPostulante);
            }

            // 2. Respaldo instantáneo local para el Panel Admin
            const postulaciones = JSON.parse(localStorage.getItem('ureta_postulaciones_db') || '[]');
            postulaciones.unshift({
                id: Date.now(),
                ...datosPostulante,
                nombreArchivoCv: archivo.name,
                url_archivo_cv: '#',
                tamanoKb: Math.round(archivo.size / 1024) + ' KB',
                fecha: new Date().toLocaleString('es-PE'),
                estado: 'Recibida'
            });
            localStorage.setItem('ureta_postulaciones_db', JSON.stringify(postulaciones));

            formPostulacion.reset();
            document.getElementById('alertaExitoPostulacion').style.display = 'flex';
        });
    }
// =========================================================
    // 10. PINTADO INSTANTÁNEO (0 MS) + ACTUALIZACIÓN EN SEGUNDO PLANO
    // =========================================================
    function pintarDatosEnPantalla(portadasActivas, testimoniosAprobados, cfg) {
        // A. Actualizar menú desplegable y selectores de las 13 áreas
        if (typeof obtenerAreasLegales === 'function') {
            const areasActivas = obtenerAreasLegales().filter(a => a.activo);
            if (areasActivas.length > 0) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.innerHTML = areasActivas.map(a =>
                        `<li><a href="area-detalle.html?area=${a.slug}">${a.nombre}</a></li>`
                    ).join('');
                });
            }
        }

        // B. Pintar Portadas al instante
        if (portadasActivas && portadasActivas.length > 0) {
            document.querySelectorAll('.hero-slide').forEach((slideEl, idx) => {
                const p = portadasActivas[idx] || portadasActivas[0];
                if (!p) return;
                if (p.imagen_url) slideEl.style.backgroundImage = `url('${p.imagen_url}')`;
                const subEl = slideEl.querySelector('.hero-badge, .hero-subtitle, .subtitle');
                const titEl = slideEl.querySelector('.hero-title, h1');
                const descEl = slideEl.querySelector('.hero-description, p');
                if (subEl && p.subtitulo) subEl.textContent = p.subtitulo;
                if (titEl && p.titulo) titEl.textContent = p.titulo;
                if (descEl && p.descripcion_breve) descEl.textContent = p.descripcion_breve;
            });
        }

        // C. Pintar Testimonios al instante
        if (testimoniosAprobados && testimoniosAprobados.length > 0) {
            document.querySelectorAll('.testimonial-slide').forEach((tEl, idx) => {
                const t = testimoniosAprobados[idx % testimoniosAprobados.length];
                const textoEl = tEl.querySelector('.testimonial-text, p');
                const autorEl = tEl.querySelector('h4');
                const cargoEl = tEl.querySelector('.testimonial-author span');
                if (textoEl) textoEl.textContent = `"${t.comentario}"`;
                if (autorEl) autorEl.textContent = t.identificacion_cliente;
                if (cargoEl) cargoEl.textContent = t.cargo_o_tipo_cliente || 'Cliente Patrocinado';
            });
        }

        // D. Pintar Configuración General, Nosotros y TODOS los botones de WhatsApp al instante
        if (cfg) {
            const mapaIds = {
                'topNombreEstudio': cfg.nombre_estudio,
                'homeTituloEstudio': cfg.nombre_estudio,
                'nosotrosTituloEstudio': cfg.nombre_estudio,
                'homeFraseInstitucional': cfg.frase_institucional,
                'nosotrosFraseInsignia': cfg.frase_institucional,
                'topDireccion': cfg.direccion_fisica,
                'sitioDireccion': cfg.direccion_fisica,
                'footerDireccion': cfg.direccion_fisica,
                'contactoDireccionTexto': cfg.direccion_fisica,
                'topTelefono': cfg.telefono_principal,
                'sitioTelefono': cfg.telefono_principal,
                'footerTelefono': cfg.telefono_principal,
                'contactoTelefonoTexto': cfg.telefono_principal,
                'sitioCorreo': cfg.correo_contacto,
                'footerCorreo': cfg.correo_contacto,
                'contactoCorreoTexto': cfg.correo_contacto,
                'sitioHorario': cfg.horario_atencion,
                'footerHorario': cfg.horario_atencion,
                'contactoHorarioTexto': cfg.horario_atencion,
                'nosotrosHistoriaTexto': cfg.historia_institucional,
                'nosotrosMisionTexto': cfg.mision,
                'nosotrosVisionTexto': cfg.vision
            };

            Object.entries(mapaIds).forEach(([idDom, valor]) => {
                const el = document.getElementById(idDom);
                if (el && valor) el.textContent = valor;
            });

            // ACTUALIZAR TODOS LOS BOTONES DE WHATSAPP (Flotante, Banners CTA y Contacto)
            if (cfg.whatsapp_numero) {
                let numLimpio = cfg.whatsapp_numero.replace(/\D/g, '');
                // Si el administrador escribió solo los 9 dígitos del celular (ej. 999322490), le agrega el 51 de Perú automáticamente
                if (numLimpio.length === 9) {
                    numLimpio = '51' + numLimpio;
                }

                const nuevoEnlaceWa = `https://api.whatsapp.com/send/?phone=${numLimpio}&text=Hola,%20deseo%20realizar%20una%20consulta%20legal`;

                document.querySelectorAll('a[href*="api.whatsapp.com"], a[href*="wa.me"], .whatsapp-float, .whatsapp-float-btn, .btn-whatsapp').forEach(btnWa => {
                    btnWa.href = nuevoEnlaceWa;
                });
            }
        }
    }

    // 1. Pintar EN EL MILISEGUNDO 0 usando el caché local (sin ningún retraso visual)
    pintarDatosEnPantalla(
        JSON.parse(localStorage.getItem('ureta_portadas_cache') || 'null'),
        JSON.parse(localStorage.getItem('ureta_testimonios_cache') || 'null'),
        JSON.parse(localStorage.getItem('ureta_config_cache') || 'null')
    );

    // 2. Sincronizar con Supabase en segundo plano y refrescar silenciosamente
    if (typeof sincronizarVistasSupabase === 'function' && supabaseEstaConfigurado()) {
        sincronizarVistasSupabase().then(() => {
            pintarDatosEnPantalla(
                JSON.parse(localStorage.getItem('ureta_portadas_cache') || 'null'),
                JSON.parse(localStorage.getItem('ureta_testimonios_cache') || 'null'),
                JSON.parse(localStorage.getItem('ureta_config_cache') || 'null')
            );
        });
    }

    aplicarCambiosPortadaTestimoniosYConfig();
});