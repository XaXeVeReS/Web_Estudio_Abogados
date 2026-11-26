document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. MOTOR DE CARRUSEL CONTINUO SUAVE + BOTONES < Y > CON PAUSA INTELIGENTE
    // =====================================================================
    const carruselesEstado = {};

    function iniciarCarruselSuave(trackId, velocidadPx = 0.65) {
        const track = document.getElementById(trackId);
        if (!track || carruselesEstado[trackId]) return;

        const shell = track.closest('.ureta-carousel-shell') || track;
        const estado = {
            pausado: false,
            pausaHasta: 0,
            acumulador: 0,
            rafId: null
        };
        carruselesEstado[trackId] = estado;

        // Pausar al pasar el mouse sobre las tarjetas O sobre los botones < y >
        shell.addEventListener('mouseenter', () => { estado.pausado = true; });
        shell.addEventListener('mouseleave', () => { estado.pausado = false; });
        track.addEventListener('touchstart', () => { estado.pausado = true; }, { passive: true });
        track.addEventListener('touchend', () => {
            estado.pausaHasta = Date.now() + 2500;
            estado.pausado = false;
        }, { passive: true });

        track.style.scrollBehavior = 'auto';

        function animar() {
            const ahora = Date.now();
            if (!estado.pausado && ahora >= estado.pausaHasta && track.scrollWidth > track.clientWidth + 5) {
                estado.acumulador += velocidadPx;
                if (estado.acumulador >= 1) {
                    const paso = Math.floor(estado.acumulador);
                    estado.acumulador -= paso;
                    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
                        track.scrollLeft = 0;
                    } else {
                        track.scrollLeft += paso;
                    }
                }
            }
            estado.rafId = requestAnimationFrame(animar);
        }
        estado.rafId = requestAnimationFrame(animar);
    }

    // Botones laterales < (retroceder) y > (avanzar)
    document.querySelectorAll('.carousel-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const trackId = btn.dataset.carousel;
            const track = document.getElementById(trackId);
            const dir = parseInt(btn.dataset.dir, 10) || 1;
            if (!track) return;

            // Congelar el auto-scroll 1.5 segundos para que no cancele el movimiento manual
            if (carruselesEstado[trackId]) {
                carruselesEstado[trackId].pausaHasta = Date.now() + 1500;
            }

            // Calcular ancho real de una tarjeta + espacio (24px)
            const primeraTarjeta = track.firstElementChild;
            const salto = primeraTarjeta ? (primeraTarjeta.getBoundingClientRect().width + 24) : 384;
            const maxScroll = track.scrollWidth - track.clientWidth;

            if (maxScroll <= 2) return;

            if (dir < 0 && track.scrollLeft <= 5) {
                // Si está al inicio y presiona <, salta al final
                track.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else if (dir > 0 && track.scrollLeft >= maxScroll - 5) {
                // Si está al final y presiona >, vuelve al inicio
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: dir * salto, behavior: 'smooth' });
            }
        });
    });

    // =====================================================================
    // 1B. PINTADO DE INICIO (100% EDITABLE DESDE contenido_paginas + CARRUSELES)
    // =====================================================================
    const INICIO_DEFECTO = {
        pres_tag: 'PRESENTACIÓN INSTITUCIONAL',
        pres_titulo: 'Estudio Jurídico Ureta & Asociados',
        pres_texto: 'Somos una de las prestigiosas firmas de abogados del Sur del Perú, que ofrece una amplia gama de profesionales de primer nivel, especializados en distintas áreas del Derecho, enfocados en encontrar soluciones sólidas e impulsar el crecimiento y desarrollo de nuestros clientes.',
        pres_imagen: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85',
        pres_badge_titulo: '9 Áreas de Práctica',
        pres_badge_sub: 'Lealtad, trascendencia y excelencia',
        pilares: [
            { icono: 'fa-solid fa-award', titulo: 'Experiencia', texto: 'Sólida trayectoria jurídica y rigor académico en cada caso.' },
            { icono: 'fa-solid fa-handshake', titulo: 'Compromiso', texto: 'Acompañamiento constante y defensa leal de sus intereses.' },
            { icono: 'fa-solid fa-briefcase', titulo: 'Calidad y Eficiencia', texto: 'Servicios legales óptimos mediante procesos eficientes.' },
            { icono: 'fa-solid fa-user-check', titulo: 'Atención personalizada', texto: 'Estrategias a medida según la realidad de cada cliente.' }
        ],
        areas_tag: 'ÁREAS DE PRÁCTICA', areas_titulo: 'Nuestras Especialidades', areas_sub: 'Brindamos patrocinio y consultoría especializada en las principales ramas del Derecho.',
        staff_tag: 'DIRECTORIO JURÍDICO', staff_titulo: 'Nuestro Equipo', staff_sub: 'Profesionales con alta formación académica dedicados a la defensa de sus intereses.',
        porque_tag: 'VALORES DIFERENCIALES', porque_titulo: '¿Por qué elegirnos?', porque_sub: 'Nuestra práctica jurídica se sustenta en la lealtad, la trascendencia, el rigor técnico y el trato directo con cada patrocinado.',
        porque_cards: [
            { icono: 'fa-solid fa-scale-unbalanced-flip', titulo: 'Experiencia profesional', texto: 'Equipo multidisciplinario con profundo dominio de la normativa vigente y los criterios jurisprudenciales.' },
            { icono: 'fa-solid fa-handshake-angle', titulo: 'Compromiso con el cliente', texto: 'Involucramiento directo desde la primera consulta hasta la conclusión del procedimiento o litigio.' },
            { icono: 'fa-solid fa-comments', titulo: 'Atención personalizada', texto: 'Comunicación clara, oportuna y transparente sobre el estado y las alternativas de su caso legal.' },
            { icono: 'fa-solid fa-chess-knight', titulo: 'Estrategia jurídica', texto: 'Enfoque preventivo y correctivo diseñado para mitigar riesgos y optimizar recursos legales.' },
            { icono: 'fa-solid fa-user-shield', titulo: 'Confidencialidad y responsabilidad', texto: 'Absoluta reserva profesional y manejo ético de la información sensible de personas y empresas.' }
        ],
        test_tag: 'CONFIANZA Y RESPALDO', test_titulo: 'Lo que opinan nuestros clientes', test_sub: 'Comentarios verificados y aprobados sobre nuestra atención jurídica.',
        art_tag: 'ACTUALIDAD JURÍDICA', art_titulo: 'Últimos Artículos', art_sub: 'Artículos de análisis jurídico, opinión legal y novedades normativas elaborados por nuestro equipo.',
        cta_titulo: '¿Necesitas asesoría legal? Estamos preparados para ayudarte',
        cta_sub: 'Agenda una consulta con nuestros especialistas para evaluar tu caso de forma reservada y oportuna.'
    };
    // =====================================================================
    // RENDERIZADO DINÁMICO E ILIMITADO DE PORTADAS (HERO SLIDER)
    // =====================================================================
    let heroSliderTimer = null;
    let ultimoHashPortadas = '';

    function renderizarHeroPortadas(portadas) {
        const heroSection = document.getElementById('homeHeroSlider');
        if (!heroSection || !Array.isArray(portadas) || portadas.length === 0) return;

        // Filtrar publicadas y ordenar por orden ascendente
        const activas = [...portadas]
            .filter(p => p.publicado !== false)
            .sort((a, b) => (a.orden - b.orden) || (a.portada_id - b.portada_id));

        if (activas.length === 0) return;

        // Evitar parpadeo si Supabase devolvió exactamente lo mismo que ya estaba en caché
        const hashActual = JSON.stringify(activas);
        if (hashActual === ultimoHashPortadas) return;
        ultimoHashPortadas = hashActual;

        // Generar dinámicamente TODAS las diapositivas (2, 3, 4, 5 o más) y sus puntos
        const slidesHtml = activas.map((p, idx) => `
            <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${p.imagen_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'}');">
                <div class="hero-overlay"></div>
                <div class="container hero-content">
                    <span class="hero-badge">${p.subtitulo || 'ESTUDIO JURÍDICO URETA & ASOCIADOS'}</span>
                    <h1 class="hero-title">${p.titulo || ''}</h1>
                    <p class="hero-description">${p.descripcion_breve || ''}</p>
                    <div class="hero-buttons">
                        <a href="${p.url_boton_1 || 'areas.html'}" class="btn btn-gold">${p.texto_boton_1 || 'Conoce nuestros servicios'}</a>
                        <a href="${p.url_boton_2 || 'contacto.html'}" class="btn btn-outline-light">${p.texto_boton_2 || 'Solicita una asesoría'}</a>
                    </div>
                </div>
            </div>
        `).join('');

        const dotsHtml = activas.length > 1
            ? `<div class="hero-controls" id="homeHeroDots">
                ${activas.map((_, idx) => `<button class="hero-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}" aria-label="Portada ${idx + 1}"></button>`).join('')}
               </div>`
            : '';

        heroSection.innerHTML = slidesHtml + dotsHtml;

        // Reiniciar el temporizador y enlazar los clics de todos los puntos nuevos
        if (heroSliderTimer) clearInterval(heroSliderTimer);

        const slides = heroSection.querySelectorAll('.hero-slide');
        const dots = heroSection.querySelectorAll('.hero-dot');
        let currentSlide = 0;

        function cambiarSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                cambiarSlide(parseInt(dot.dataset.slide, 10));
                if (heroSliderTimer) {
                    clearInterval(heroSliderTimer);
                    heroSliderTimer = setInterval(() => cambiarSlide((currentSlide + 1) % slides.length), 6000);
                }
            });
        });

        if (slides.length > 1) {
            heroSliderTimer = setInterval(() => {
                cambiarSlide((currentSlide + 1) % slides.length);
            }, 6000);
        }
    }

    function renderizarContenidoGlobalYHome() {
        if (typeof window.actualizarLayoutMaestro === 'function') window.actualizarLayoutMaestro();

        // A. Pintar TODAS las Portadas del Hero dinámicamente
        const portadas = JSON.parse(localStorage.getItem('ureta_portadas_cache') || 'null');
        renderizarHeroPortadas(portadas);

        // B. Contenido 100% Editable de Inicio (index.html)
        const ini = Object.assign({}, INICIO_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_inicio_cache') || '{}'));
        const mapaInicio = {
            'homePresTag': ini.pres_tag, 'homeTituloEstudio': ini.pres_titulo, 'homePresTexto': ini.pres_texto,
            'homeCantidadAreas': ini.pres_badge_titulo, 'homeFraseInstitucional': ini.pres_badge_sub,
            'homeAreasTag': ini.areas_tag, 'homeAreasTitulo': ini.areas_titulo, 'homeAreasSub': ini.areas_sub,
            'homeStaffTag': ini.staff_tag, 'homeStaffTitulo': ini.staff_titulo, 'homeStaffSub': ini.staff_sub,
            'homePorqueTag': ini.porque_tag, 'homePorqueTitulo': ini.porque_titulo, 'homePorqueSub': ini.porque_sub,
            'homeTestTag': ini.test_tag, 'homeTestTitulo': ini.test_titulo, 'homeTestSub': ini.test_sub,
            'homeArtTag': ini.art_tag, 'homeArtTitulo': ini.art_titulo, 'homeArtSub': ini.art_sub,
            'homeCtaTitulo': ini.cta_titulo, 'homeCtaSub': ini.cta_sub
        };
        Object.entries(mapaInicio).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        const imgPres = document.getElementById('homePresImagen');
        if (imgPres && ini.pres_imagen) imgPres.src = ini.pres_imagen;

        const pilaresGrid = document.getElementById('homePilaresGrid');
        if (pilaresGrid && Array.isArray(ini.pilares)) {
            pilaresGrid.innerHTML = ini.pilares.map(p => `
                <div class="pillar-box">
                    <div class="pillar-icon"><i class="${p.icono || 'fa-solid fa-check'}"></i></div>
                    <div><h4>${p.titulo}</h4><p>${p.texto}</p></div>
                </div>
            `).join('');
        }

        const whyGrid = document.getElementById('homeWhyGrid');
        if (whyGrid && Array.isArray(ini.porque_cards)) {
            whyGrid.innerHTML = ini.porque_cards.map(c => `
                <div class="why-card">
                    <div class="why-icon"><i class="${c.icono || 'fa-solid fa-star'}"></i></div>
                    <h3>${c.titulo}</h3>
                    <p>${c.texto}</p>
                </div>
            `).join('');
        }

        // C. Configuración General para Nosotros y Contacto
        const cfg = JSON.parse(localStorage.getItem('ureta_config_cache') || 'null');
        if (cfg) {
            const mapaCfg = {
                'nosotrosTituloEstudio': cfg.nombre_estudio, 'nosotrosFraseInsignia': cfg.frase_institucional,
                'contactoDireccionTexto': cfg.direccion_fisica, 'contactoTelefonoTexto': cfg.telefono_principal,
                'contactoCorreoTexto': cfg.correo_contacto, 'contactoHorarioTexto': cfg.horario_atencion,
                'nosotrosHistoriaTexto': cfg.historia_institucional, 'nosotrosMisionTexto': cfg.mision, 'nosotrosVisionTexto': cfg.vision
            };
            Object.entries(mapaCfg).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.textContent = val;
            });
        }

        // D. Carrusel 1: TODAS las Áreas Legales Activas
        const homeAreasGrid = document.getElementById('homeAreasGrid');
        const areasActivas = obtenerAreasLegales().filter(a => a.activo);
        if (homeAreasGrid && areasActivas.length > 0) {
            const btnTotal = document.getElementById('btnVerTodasAreas');
            if (btnTotal) btnTotal.textContent = `Consultar todas nuestras especialidades (${areasActivas.length})`;
            homeAreasGrid.innerHTML = areasActivas.map(a => `
                <article class="area-card">
                    <div class="area-card-img"><img src="${a.imagen}" alt="${a.nombre}"></div>
                    <div class="area-card-body">
                        <h3><i class="${a.icono || 'fa-solid fa-scale-balanced'}" style="color:var(--dorado); margin-right:6px;"></i> ${a.nombre}</h3>
                        <p>${a.resumen}</p>
                        <a href="area-detalle.html?area=${a.slug}" class="card-link">Conocer más <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            `).join('');
            iniciarCarruselSuave('homeAreasGrid', 0.65);
        }

        // E. Carrusel 2: TODO Nuestro Equipo (Staff)
        const homeStaffGrid = document.getElementById('homeStaffGrid');
        const staffActivo = obtenerStaff().filter(s => s.activo);
        if (homeStaffGrid && staffActivo.length > 0) {
            homeStaffGrid.innerHTML = staffActivo.map(s => `
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
            iniciarCarruselSuave('homeStaffGrid', 0.55);
        }

        // F. Carrusel 3: Testimonios de Clientes
        const homeTestGrid = document.getElementById('homeTestGrid');
        const testimonios = JSON.parse(localStorage.getItem('ureta_testimonios_cache') || '[]');
        if (homeTestGrid) {
            const listaTest = testimonios.length > 0 ? testimonios : [
                { identificacion_cliente: 'J. R. M.', cargo_o_tipo_cliente: 'Cliente Corporativo', comentario: 'Destaco la claridad y el profesionalismo con el que absolvieron cada una de nuestras consultas societarias.' },
                { identificacion_cliente: 'M. C. V.', cargo_o_tipo_cliente: 'Cliente Particular', comentario: 'Recibimos una orientación oportuna, transparente y sumamente responsable durante todo el procedimiento de saneamiento registral.' }
            ];
            homeTestGrid.innerHTML = listaTest.map(t => {
                const iniciales = (t.identificacion_cliente || 'CL').replace(/[^A-Za-z]/g, '').substring(0, 2).toUpperCase() || 'CL';
                return `
                    <article class="testimonial-card-slide">
                        <div>
                            <div class="quote-icon"><i class="fa-solid fa-quote-left"></i></div>
                            <p class="testimonial-text">"${t.comentario}"</p>
                        </div>
                        <div class="testimonial-author">
                            <div class="author-avatar">${iniciales}</div>
                            <div>
                                <h4>${t.identificacion_cliente}</h4>
                                <span>${t.cargo_o_tipo_cliente || 'Cliente Patrocinado'}</span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
            iniciarCarruselSuave('homeTestGrid', 0.5);
        }

        // G. Carrusel 4: Últimos Artículos
        const homeBlogGrid = document.getElementById('homeBlogGrid');
        const blogPublicado = obtenerBlog().filter(b => b.estado === 'Publicado');
        if (homeBlogGrid && blogPublicado.length > 0) {
            homeBlogGrid.innerHTML = blogPublicado.map(b => `
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
            iniciarCarruselSuave('homeBlogGrid', 0.6);
        }
    }

    // =====================================================================
    // 1C. PINTADO 100% EDITABLE DE LA PÁGINA "NOSOTROS" (nosotros.html)
    // =====================================================================
    const NOSOTROS_DEFECTO = {
        banner_tag: 'NUESTRA FIRMA JURÍDICA',
        banner_titulo: 'Sobre Estudio Jurídico Ureta & Asociados',
        banner_sub: 'Lealtad, trascendencia y excelencia al servicio de personas, familias y empresas en Arequipa y la Región Sur.',
        banner_img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        hist_tag: 'QUIÉNES SOMOS',
        hist_titulo: 'Estudio Jurídico Ureta & Asociados',
        hist_texto_1: 'Somos una prestigiosa firma de abogados en Arequipa que reúne a profesionales especializados en 9 ramas clave del Derecho, enfocados en brindar soluciones jurídicas sólidas, preventivas y estratégicas.',
        hist_texto_2: 'Acompañamos cada decisión patrimonial, empresarial, penal, laboral o familiar con rigor académico, trato directo de nuestros socios y absoluta confidencialidad en cada etapa del proceso.',
        hist_img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85',
        badge_titulo: 'Sede Arequipa',
        badge_sub: 'Lealtad, trascendencia y excelencia',
        mv_tag: 'IDENTIDAD INSTITUCIONAL',
        mv_titulo: 'Misión, Visión y Filosofía de Trabajo',
        mv_sub: 'Los principios que guían nuestra práctica profesional y el respaldo hacia cada patrocinado.',
        mision_titulo: 'Nuestra Misión',
        mision_texto: 'Brindar asesoría legal integral, preventiva y patrocinio estratégico de alta exigencia técnica, protegiendo los derechos y el patrimonio de nuestros clientes con ética y transparencia.',
        vision_titulo: 'Nuestra Visión',
        vision_texto: 'Consolidarnos como la firma jurídica referente en Arequipa y la Región Sur del Perú, reconocida por su solidez académica, lealtad institucional y formación de nuevas generaciones de abogados.',
        filo_titulo: 'Filosofía de Trabajo',
        filo_texto: 'Cada caso recibe análisis multidisciplinario, estrategia a medida y comunicación constante, priorizando soluciones eficaces antes, durante y después de cualquier controversia.',
        val_tag: 'PRINCIPIOS Y CULTURA',
        val_titulo: 'Nuestros Valores y Compromiso Ético',
        val_desc: 'Nuestro ejercicio profesional se sostiene sobre estándares firmes que garantizan confianza y resultados sostenibles para quienes nos confían sus casos:',
        val_img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=85',
        valores: [
            'Lealtad absoluta y defensa responsable de los intereses de cada patrocinado.',
            'Rigor académico y actualización jurisprudencial constante en nuestras 9 especialidades.',
            'Confidencialidad estricta y manejo reservado de la información personal y corporativa.',
            'Transparencia en el diagnóstico legal, plazos procesales y alternativas de solución.',
            'Trascendencia profesional: formamos practicantes y abogados con vocación ética.'
        ],
        cta_titulo: '¿Deseas conocer cómo podemos respaldar tu caso o empresa?',
        cta_sub: 'Agenda una reunión confidencial con nuestro equipo de especialistas en nuestra sede de Urb. Vallecito o vía virtual.'
    };

    function renderizarPaginaNosotros() {
        const banner = document.getElementById('nosBanner');
        if (!banner) return;

        const nos = Object.assign({}, NOSOTROS_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_nosotros_cache') || '{}'));

        if (nos.banner_img) banner.style.backgroundImage = `url('${nos.banner_img}')`;
        const imgHist = document.getElementById('nosHistImagen');
        if (imgHist && nos.hist_img) imgHist.src = nos.hist_img;
        const imgVal = document.getElementById('nosValImagen');
        if (imgVal && nos.val_img) imgVal.src = nos.val_img;

        const mapaNos = {
            'nosBannerTag': nos.banner_tag,
            'nosBannerTitulo': nos.banner_titulo,
            'nosBannerSub': nos.banner_sub,
            'nosBadgeTitulo': nos.badge_titulo,
            'nosBadgeSub': nos.badge_sub,
            'nosHistTag': nos.hist_tag,
            'nosotrosTituloEstudio': nos.hist_titulo,
            'nosotrosHistoriaTexto': nos.hist_texto_1,
            'nosHistParrafo2': nos.hist_texto_2,
            'nosMvTag': nos.mv_tag,
            'nosMvTitulo': nos.mv_titulo,
            'nosMvSub': nos.mv_sub,
            'nosMisionTitulo': nos.mision_titulo,
            'nosotrosMisionTexto': nos.mision_texto,
            'nosVisionTitulo': nos.vision_titulo,
            'nosotrosVisionTexto': nos.vision_texto,
            'nosFiloTitulo': nos.filo_titulo,
            'nosFiloTexto': nos.filo_texto,
            'nosValTag': nos.val_tag,
            'nosValTitulo': nos.val_titulo,
            'nosValDesc': nos.val_desc,
            'nosCtaTitulo': nos.cta_titulo,
            'nosCtaSub': nos.cta_sub
        };
        Object.entries(mapaNos).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        const listaVal = document.getElementById('nosValLista');
        if (listaVal && Array.isArray(nos.valores)) {
            listaVal.innerHTML = nos.valores.map(v => `
                <li><i class="fa-solid fa-circle-check"></i> <span>${v}</span></li>
            `).join('');
        }
    }

    // =====================================================================
    // 1D. PINTADO 100% EDITABLE DE "ÁREAS" (areas.html y area-detalle.html)
    // =====================================================================
    const AREAS_PAGINA_DEFECTO = {
        banner_tag: 'ESPECIALIDADES JURÍDICAS',
        banner_titulo: 'Nuestras Áreas de Práctica',
        banner_sub: 'Brindamos asesoría legal integral y patrocinio estratégico a cargo de abogados especialistas en 9 ramas clave del Derecho.',
        banner_img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
        cat_tag: 'PORTAFOLIO LEGAL',
        cat_titulo: 'Especialidades del Estudio',
        cat_sub: 'Selecciona una especialidad para conocer el alcance del servicio, los casos que atendemos y solicitar una consulta directa.',
        buscador_placeholder: 'Buscar especialidad jurídica (ej. Civil, Penal, Laboral, Saneamientos)...',
        det_badge: 'ÁREA DE PRÁCTICA ESPECIALIZADA',
        det_alcance_tag: 'ALCANCE DEL SERVICIO',
        det_alcance_titulo: 'Presentación del Área',
        det_servicios_titulo: 'Principales Servicios que Ofrecemos',
        det_situaciones_titulo: '¿En qué situaciones brindamos asesoría?',
        det_form_tag: 'CONSULTA DIRECTA',
        det_form_titulo: 'Consultar con un Especialista',
        det_form_sub: 'Déjanos tus datos y el equipo de esta área te responderá a la brevedad con absoluta reserva.',
        det_sidebar_titulo: 'Todas Nuestras Especialidades',
        cta_titulo: '¿Requieres patrocinio o consultoría en alguna especialidad?',
        cta_sub: 'Agenda una reunión confidencial con nuestros especialistas para analizar la estrategia legal más segura para tu caso.'
    };

    function renderizarPaginaAreas() {
        const ar = Object.assign({}, AREAS_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_areas_cache') || '{}'));

        // Banner de areas.html
        const bannerAreas = document.getElementById('areasBanner');
        if (bannerAreas && ar.banner_img) {
            bannerAreas.style.backgroundImage = `url('${ar.banner_img}')`;
        }

        const buscadorAreas = document.getElementById('buscarAreaInput');
        if (buscadorAreas && ar.buscador_placeholder) {
            buscadorAreas.placeholder = ar.buscador_placeholder;
        }

        // Textos editables tanto de areas.html como de area-detalle.html
        const mapaAreas = {
            'areasBannerTag': ar.banner_tag,
            'areasBannerTitulo': ar.banner_titulo,
            'areasBannerSub': ar.banner_sub,
            'areasCatTag': ar.cat_tag,
            'areasCatTitulo': ar.cat_titulo,
            'areasCatSub': ar.cat_sub,
            'areasCtaTitulo': ar.cta_titulo,
            'areasCtaSub': ar.cta_sub,
            'areaDetBadge': ar.det_badge,
            'areaDetAlcanceTag': ar.det_alcance_tag,
            'areaDetAlcanceTitulo': ar.det_alcance_titulo,
            'areaDetServiciosTitulo': ar.det_servicios_titulo,
            'areaDetSituacionesTitulo': ar.det_situaciones_titulo,
            'areaDetFormTag': ar.det_form_tag,
            'areaDetFormTitulo': ar.det_form_titulo,
            'areaDetFormSub': ar.det_form_sub,
            'areaDetSidebarTitulo': ar.det_sidebar_titulo,
            'areaDetCtaTitulo': ar.cta_titulo,
            'areaDetCtaSub': ar.cta_sub
        };
        Object.entries(mapaAreas).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        // Refrescar tarjetas del catálogo y ficha detalle si están en pantalla
        if (typeof window.refrescarCatalogoAreas === 'function') window.refrescarCatalogoAreas();
        if (typeof window.refrescarDetalleArea === 'function') window.refrescarDetalleArea();
    }
// =====================================================================
    // 1E. PINTADO 100% EDITABLE DE "NUESTRO STAFF" (staff.html)
    // =====================================================================
    const STAFF_PAGINA_DEFECTO = {
        banner_tag: 'DIRECTORIO JURÍDICO',
        banner_titulo: 'Nuestro Staff de Abogados',
        banner_sub: 'Conoce al equipo multidisciplinario de especialistas comprometidos con la lealtad, trascendencia y excelencia en cada patrocinio.',
        banner_img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
        dir_tag: 'EQUIPO ESPECIALIZADO',
        dir_titulo: 'Profesionales a tu Servicio',
        dir_sub: 'Busca por nombre, cargo o filtra por especialidad jurídica para revisar la ficha académica y profesional de cada integrante.',
        buscador_placeholder: 'Buscar abogado por nombre o cargo...',
        filtro_todas_texto: 'Todas las especialidades',
        btn_perfil_texto: 'Ver ficha profesional',
        cta_titulo: '¿Deseas agendar una consulta con alguno de nuestros especialistas?',
        cta_sub: 'Coordina una cita presencial en nuestra sede de Urb. Vallecito o vía virtual con total confidencialidad.'
    };

    function renderizarPaginaStaff() {
        const banner = document.getElementById('staffBanner');
        if (!banner) return;

        const st = Object.assign({}, STAFF_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_staff_cache') || '{}'));
        if (st.banner_img) banner.style.backgroundImage = `url('${st.banner_img}')`;

        const buscador = document.getElementById('buscarAbogadoInput');
        if (buscador && st.buscador_placeholder) buscador.placeholder = st.buscador_placeholder;

        const mapaStaff = {
            'staffBannerTag': st.banner_tag,
            'staffBannerTitulo': st.banner_titulo,
            'staffBannerSub': st.banner_sub,
            'staffDirTag': st.dir_tag,
            'staffDirTitulo': st.dir_titulo,
            'staffDirSub': st.dir_sub,
            'staffCtaTitulo': st.cta_titulo,
            'staffCtaSub': st.cta_sub
        };
        Object.entries(mapaStaff).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        // Guardar textos dinámicos para usarlos dentro del filtro y botones de tarjetas
        window.__staffTextosUi = st;
        if (typeof window.refrescarDirectorioStaff === 'function') window.refrescarDirectorioStaff();
    }

    renderizarContenidoGlobalYHome();
    renderizarPaginaNosotros();
    renderizarPaginaAreas();
    renderizarPaginaStaff();

    if (typeof sincronizarVistasSupabase === 'function' && supabaseEstaConfigurado()) {
        Promise.all([
            sincronizarVistasSupabase(),
            consultarVistaSupabase('contenido_paginas', '?select=pagina_slug,datos').then(filas => {
                if (Array.isArray(filas)) {
                    filas.forEach(f => {
                        if (f.pagina_slug && f.datos) {
                            localStorage.setItem(`ureta_pagina_${f.pagina_slug}_cache`, JSON.stringify(f.datos));
                        }
                    });
                }
            })
        ]).then(() => {
            renderizarContenidoGlobalYHome();
            renderizarPaginaNosotros();
            renderizarPaginaAreas();
            renderizarPaginaStaff();
        });
    }
    // =====================================================================
    // 3. CATÁLOGO Y DETALLE DE ESPECIALIDADES (areas.html / area-detalle.html)
    // =====================================================================
    const catalogoAreasContainer = document.getElementById('catalogoAreasContainer');
    if (catalogoAreasContainer) {
        const inputBuscarArea = document.getElementById('buscarAreaInput');

        window.refrescarCatalogoAreas = function () {
            const q = (inputBuscarArea?.value || '').trim().toLowerCase();
            const areas = obtenerAreasLegales().filter(a => a.activo && (
                !q ||
                a.nombre.toLowerCase().includes(q) ||
                (a.resumen || '').toLowerCase().includes(q)
            ));

            catalogoAreasContainer.innerHTML = areas.map(area => `
                <article class="area-card">
                    <div class="area-card-img"><img src="${area.imagen}" alt="${area.nombre}"></div>
                    <div class="area-card-body">
                        <h3><i class="${area.icono || 'fa-solid fa-scale-balanced'}" style="color: var(--dorado); margin-right: 6px;"></i> ${area.nombre}</h3>
                        <p>${area.resumen}</p>
                        <a href="area-detalle.html?area=${area.slug}" class="card-link">Conocer más <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </article>
            `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">No se encontraron especialidades que coincidan con "${q}".</p>`;
        };

        inputBuscarArea?.addEventListener('input', window.refrescarCatalogoAreas);
        window.refrescarCatalogoAreas();
    }

    const areaNombreEl = document.getElementById('areaNombre');
    if (areaNombreEl) {
        let areaActualRef = null;

        window.refrescarDetalleArea = function () {
            const slugBuscado = new URLSearchParams(window.location.search).get('area') || 'derecho-civil';
            const areas = obtenerAreasLegales();
            const areaActual = areas.find(a => a.slug === slugBuscado) || areas[0];
            if (!areaActual) return;
            areaActualRef = areaActual;

            document.getElementById('pageAreaTitle').textContent = `${areaActual.nombre} | Estudio Jurídico Ureta & Asociados`;
            document.getElementById('areaBannerImg').style.backgroundImage = `url('${areaActual.imagen}')`;
            document.getElementById('areaIcono').className = areaActual.icono || 'fa-solid fa-scale-balanced';
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
        };

        window.refrescarDetalleArea();

        const formRapido = document.getElementById('formConsultaRapidaArea');
        if (formRapido) {
            formRapido.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nombreArea = areaActualRef ? areaActualRef.nombre : 'Consulta General';
                const nueva = {
                    nombres: document.getElementById('rapidoNombre').value.trim(),
                    telefono: document.getElementById('rapidoTelefono').value.trim(),
                    correo: document.getElementById('rapidoCorreo').value.trim(),
                    empresa: '',
                    area: nombreArea,
                    asunto: `Consulta desde especialidad: ${nombreArea}`,
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
    // 4. DIRECTORIO DE STAFF (staff.html - FILTRO DINÁMICO Y MODAL SIN EXPERIENCIA)
    // =====================================================================
    const staffGrid = document.getElementById('staffDirectorioGrid');
    if (staffGrid) {
        const inputBuscar = document.getElementById('buscarAbogadoInput');
        const selectEsp = document.getElementById('filtroEspecialidadStaff');
        const modalStaff = document.getElementById('modalFichaAbogado');
        const modalContenido = document.getElementById('modalStaffContenido');

        function poblarFiltroEspecialidadesStaff() {
            if (!selectEsp) return;
            const seleccionPrevia = selectEsp.value || 'Todas';
            const etiquetaTodas = window.__staffTextosUi?.filtro_todas_texto || 'Todas las especialidades';
            const areasActivas = obtenerAreasLegales().filter(a => a.activo);

            selectEsp.innerHTML = `<option value="Todas">${etiquetaTodas}</option>` +
                areasActivas.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('');

            if ([...selectEsp.options].some(o => o.value === seleccionPrevia)) {
                selectEsp.value = seleccionPrevia;
            }
        }

        window.refrescarDirectorioStaff = function () {
            poblarFiltroEspecialidadesStaff();
            const texto = (inputBuscar?.value || '').trim().toLowerCase();
            const esp = selectEsp?.value || 'Todas';
            const textoBtn = window.__staffTextosUi?.btn_perfil_texto || 'Ver ficha profesional';

            const filtrados = obtenerStaff().filter(ab => ab.activo &&
                (
                    !texto ||
                    ab.nombre.toLowerCase().includes(texto) ||
                    ab.cargo.toLowerCase().includes(texto) ||
                    (ab.especialidades || []).some(e => e.toLowerCase().includes(texto))
                ) &&
                (esp === 'Todas' || (ab.especialidades || []).includes(esp))
            );

            staffGrid.innerHTML = filtrados.map(ab => `
                <div class="staff-card">
                    <div class="staff-img-wrapper"><img src="${ab.foto}" alt="${ab.nombre}"></div>
                    <div class="staff-info">
                        <span class="staff-role">${ab.cargo}</span>
                        <h3>${ab.nombre}</h3>
                        <div class="staff-tags">${(ab.especialidades || []).map(e => `<span class="staff-tag">${e}</span>`).join('')}</div>
                        <button type="button" class="btn-staff-profile" onclick="abrirFichaAbogado(${ab.id})">${textoBtn}</button>
                    </div>
                </div>
            `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">No se encontraron abogados con ese criterio de búsqueda.</p>`;
        };

        window.abrirFichaAbogado = function (id) {
            const ab = obtenerStaff().find(item => item.id === id);
            if (!ab) return;
            modalContenido.innerHTML = `
                <div><img src="${ab.foto}" alt="${ab.nombre}" class="modal-staff-img"></div>
                <div class="modal-staff-details">
                    <span class="staff-role">${ab.cargo}</span>
                    <h2>${ab.nombre}</h2>
                    <p style="font-size:0.86rem; color: var(--dorado-hover); font-weight:600;">
                        <i class="fa-solid fa-id-card"></i> Colegiatura: ${ab.colegiatura || 'Registro Habilitado'}
                    </p>
                    <div class="staff-detail-block">
                        <h4>Especialidades</h4>
                        <p>${(ab.especialidades || []).join(' • ') || 'Asesoría Jurídica Integral'}</p>
                    </div>
                    <div class="staff-detail-block">
                        <h4>Formación Académica</h4>
                        <p>${ab.formacion || ''}</p>
                    </div>
                    <div class="staff-detail-block">
                        <h4>Cursos y Especializaciones</h4>
                        <p>${ab.cursos || 'Especialización continua'}</p>
                    </div>
                    <div class="staff-detail-block">
                        <h4>Biografía</h4>
                        <p>${ab.biografia || ''}</p>
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

        document.getElementById('cerrarModalStaff')?.addEventListener('click', () => modalStaff.classList.remove('open'));
        modalStaff?.addEventListener('click', (e) => {
            if (e.target === modalStaff) modalStaff.classList.remove('open');
        });

        inputBuscar?.addEventListener('input', window.refrescarDirectorioStaff);
        selectEsp?.addEventListener('change', window.refrescarDirectorioStaff);
        window.refrescarDirectorioStaff();
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