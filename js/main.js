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

    // =====================================================================
    // 1F. PINTADO 100% EDITABLE DE "ARTÍCULOS" (blog.html)
    // =====================================================================
    const ARTICULOS_PAGINA_DEFECTO = {
        banner_tag: 'ACTUALIDAD Y OPINIÓN JURÍDICA',
        banner_titulo: 'Artículos Jurídicos',
        banner_sub: 'Análisis doctrinales, criterios jurisprudenciales y novedades normativas elaborados por el equipo de Estudio Jurídico Ureta & Asociados.',
        banner_img: 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?auto=format&fit=crop&w=1600&q=80',
        sec_tag: 'PUBLICACIONES RECIENTES',
        sec_titulo: 'Biblioteca de Artículos y Análisis',
        sec_sub: 'Explora nuestras publicaciones propias, análisis jurídicos y notas de actualidad filtrando por tema o palabra clave.',
        buscador_placeholder: 'Buscar artículo por título, tema o autor...',
        filtro_cat_todas: 'Todas las categorías',
        filtro_tipo_todos: 'Todos los tipos',
        etiqueta_destacado: 'ARTÍCULO DESTACADO',
        btn_leer_texto: 'Leer artículo',
        comentarios_titulo: 'Dejar un comentario',
        cta_titulo: '¿Tienes dudas sobre algún tema normativo o jurisprudencial?',
        cta_sub: 'Nuestros abogados especialistas pueden orientarte con un análisis aplicado a tu caso concreto.'
    };

    function renderizarPaginaArticulos() {
        const banner = document.getElementById('artBanner');
        if (!banner) return;

        const art = Object.assign({}, ARTICULOS_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_articulos_cache') || '{}'));
        if (art.banner_img) banner.style.backgroundImage = `url('${art.banner_img}')`;

        const buscador = document.getElementById('buscarBlogInput');
        if (buscador && art.buscador_placeholder) buscador.placeholder = art.buscador_placeholder;

        const optTodosTipo = document.querySelector('#filtroTipoBlog option[value="Todos"]');
        if (optTodosTipo && art.filtro_tipo_todos) optTodosTipo.textContent = art.filtro_tipo_todos;

        const mapaArt = {
            'artBannerTag': art.banner_tag,
            'artBannerTitulo': art.banner_titulo,
            'artBannerSub': art.banner_sub,
            'artSecTag': art.sec_tag,
            'artSecTitulo': art.sec_titulo,
            'artSecSub': art.sec_sub,
            'artCtaTitulo': art.cta_titulo,
            'artCtaSub': art.cta_sub
        };
        Object.entries(mapaArt).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        window.__articulosTextosUi = art;
        if (typeof window.refrescarListadoBlog === 'function') window.refrescarListadoBlog();
    }

    // =====================================================================
    // 1G. PINTADO 100% EDITABLE DE "EVENTOS ACADÉMICOS" (eventos.html)
    // =====================================================================
    const EVENTOS_PAGINA_DEFECTO = {
        banner_tag: 'CAPACITACIÓN Y EXTENSIÓN JURÍDICA',
        banner_titulo: 'Eventos Académicos',
        banner_sub: 'Conferencias, seminarios y jornadas de actualización jurídica organizadas por Estudio Jurídico Ureta & Asociados para profesionales y estudiantes de Derecho.',
        banner_img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
        sec_tag: 'AGENDA ACADÉMICA',
        sec_titulo: 'Próximos Eventos y Jornadas',
        sec_sub: 'Consulta el temario, ponentes y modalidad de cada actividad académica e inscríbete directamente mediante nuestro formulario oficial.',
        buscador_placeholder: 'Buscar evento por título, categoría o ponente...',
        filtro_mod_todas: 'Todas las modalidades',
        etiqueta_destacado: 'PRÓXIMO EVENTO DESTACADO',
        btn_detalle_texto: 'Ver información',
        btn_inscribir_texto: 'Inscribirme (Forms)',
        cta_titulo: '¿Deseas proponer un convenio académico o capacitación institucional?',
        cta_sub: 'Coordinamos conferencias, talleres corporativos y jornadas universitarias con nuestros abogados especialistas.'
    };

    function renderizarPaginaEventos() {
        const banner = document.getElementById('evBanner');
        if (!banner) return;

        const ev = Object.assign({}, EVENTOS_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_eventos_cache') || '{}'));
        if (ev.banner_img) banner.style.backgroundImage = `url('${ev.banner_img}')`;

        const buscador = document.getElementById('buscarEventoInput');
        if (buscador && ev.buscador_placeholder) buscador.placeholder = ev.buscador_placeholder;

        const optTodas = document.querySelector('#filtroModalidadEvento option[value="Todas"]');
        if (optTodas && ev.filtro_mod_todas) optTodas.textContent = ev.filtro_mod_todas;

        const mapaEv = {
            'evBannerTag': ev.banner_tag,
            'evBannerTitulo': ev.banner_titulo,
            'evBannerSub': ev.banner_sub,
            'evSecTag': ev.sec_tag,
            'evSecTitulo': ev.sec_titulo,
            'evSecSub': ev.sec_sub,
            'evCtaTitulo': ev.cta_titulo,
            'evCtaSub': ev.cta_sub
        };
        Object.entries(mapaEv).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        window.__eventosTextosUi = ev;
        if (typeof window.refrescarListadoEventos === 'function') window.refrescarListadoEventos();
    }
// =====================================================================
    // 1H. PINTADO 100% EDITABLE DE "TRABAJA CON NOSOTROS" (trabaja-con-nosotros.html)
    // =====================================================================
    const TRABAJA_PAGINA_DEFECTO = {
        banner_tag: 'PROGRAMA DE PRACTICANTES Y LÍNEA DE CARRERA',
        banner_titulo: 'Inicia tu formación jurídica y haz línea de carrera con nosotros',
        banner_sub: 'En Estudio Jurídico Ureta & Asociados formamos a futuros abogados de excelencia. Si eres estudiante de los últimos ciclos o recién egresado, te ofrecemos mentoría directa y oportunidades reales de crecimiento.',
        banner_img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        ben_tag: 'CULTURA DE EXCELENCIA',
        ben_titulo: '¿Por qué integrarte a nuestra firma?',
        ben_sub: 'Apostamos por el talento joven con vocación ética, rigor técnico y proyección profesional en nuestras 9 especialidades.',
        beneficios: [
            { icono: 'fa-solid fa-graduation-cap', titulo: 'Mentoría directa', texto: 'Aprendizaje práctico junto a socios y abogados especialistas en audiencias, escritos y asesoría.' },
            { icono: 'fa-solid fa-arrow-up-right-dots', titulo: 'Línea de carrera real', texto: 'Evaluación continua para pasar de practicante preprofesional a profesional y abogado asociado.' },
            { icono: 'fa-solid fa-scale-balanced', titulo: 'Casos de alto rigor', texto: 'Participación en expedientes civiles, penales, laborales, registrales, arbitrales y corporativos.' },
            { icono: 'fa-solid fa-book-open-reader', titulo: 'Formación continua', texto: 'Acceso a jornadas académicas internas, investigación jurídica y publicación de artículos.' }
        ],
        hist_tag: 'HISTORIAS DE CRECIMIENTO REAL',
        hist_titulo: 'De Practicante a Abogado',
        hist_sub: 'Conoce a los profesionales que iniciaron su formación como practicantes en nuestra firma y hoy lideran casos estratégicos como abogados del estudio.',
        vac_tag: 'CONVOCATORIAS VIGENTES',
        vac_titulo: 'Oportunidades para Practicantes y Talento Jurídico',
        vac_sub: 'Revisa los requisitos de nuestras convocatorias abiertas y postula adjuntando tu CV en formato PDF.',
        esp_titulo: '¿No encuentras una convocatoria abierta para tu especialidad?',
        esp_sub: 'Envíanos tu CV mediante una Postulación Espontánea y lo incorporaremos a nuestra base de talento para futuras plazas.',
        esp_btn: 'Enviar Postulación Espontánea',
        form_tag: 'POSTULACIÓN EN LÍNEA',
        form_titulo: 'Formulario de Postulación (CV en PDF)',
        form_sub: 'Completa tus datos académicos y adjunta tu currículum actualizado en PDF (máximo 5 MB). Tu información se trata de forma estrictamente confidencial.',
        proc_titulo: 'Etapas del Proceso de Selección',
        proc_pasos: [
            '1. Recepción y revisión curricular de tu perfil académico.',
            '2. Evaluación técnica de análisis y redacción jurídica.',
            '3. Entrevista personal con la coordinación y socios del área.',
            '4. Incorporación al equipo y plan de mentoría institucional.'
        ],
        sede_titulo: 'Nuestra Sede en Arequipa',
        sede_img: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
        sede_texto: 'Calle 28 de Julio 701, Urb. Vallecito — Arequipa. Un espacio diseñado para el estudio riguroso y el trabajo en equipo.'
    };

    function renderizarPaginaTrabaja() {
        const banner = document.getElementById('trabBanner');
        if (!banner) return;

        const tr = Object.assign({}, TRABAJA_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_trabaja_cache') || '{}'));
        if (tr.banner_img) banner.style.backgroundImage = `url('${tr.banner_img}')`;

        const imgSede = document.getElementById('trabSedeImg');
        if (imgSede && tr.sede_img) imgSede.src = tr.sede_img;

        const mapaTr = {
            'trabBannerTag': tr.banner_tag,
            'trabBannerTitulo': tr.banner_titulo,
            'trabBannerSub': tr.banner_sub,
            'trabBenTag': tr.ben_tag,
            'trabBenTitulo': tr.ben_titulo,
            'trabBenSub': tr.ben_sub,
            'trabHistTag': tr.hist_tag,
            'trabHistTitulo': tr.hist_titulo,
            'trabHistSub': tr.hist_sub,
            'trabVacTag': tr.vac_tag,
            'trabVacTitulo': tr.vac_titulo,
            'trabVacSub': tr.vac_sub,
            'trabEspTitulo': tr.esp_titulo,
            'trabEspSub': tr.esp_sub,
            'trabEspBtn': tr.esp_btn,
            'trabFormTag': tr.form_tag,
            'trabFormTitulo': tr.form_titulo,
            'trabFormSub': tr.form_sub,
            'trabProcTitulo': tr.proc_titulo,
            'trabSedeTitulo': tr.sede_titulo,
            'trabSedeTexto': tr.sede_texto
        };
        Object.entries(mapaTr).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        // 4 Tarjetas de Beneficios
        const benGrid = document.getElementById('trabBeneficiosGrid');
        if (benGrid && Array.isArray(tr.beneficios)) {
            benGrid.innerHTML = tr.beneficios.map(b => `
                <div class="mv-card">
                    <div class="mv-icon"><i class="${b.icono || 'fa-solid fa-star'}"></i></div>
                    <h3>${b.titulo || ''}</h3>
                    <p>${b.texto || ''}</p>
                </div>
            `).join('');
        }

        // Lista de Etapas del Proceso
        const procLista = document.getElementById('trabProcLista');
        if (procLista && Array.isArray(tr.proc_pasos)) {
            procLista.innerHTML = tr.proc_pasos.map(p => `
                <li><i class="fa-solid fa-circle-check"></i> <span>${p}</span></li>
            `).join('');
        }

        // Refrescar historias y vacantes si están en pantalla
        if (typeof window.refrescarTrabajaConNosotros === 'function') window.refrescarTrabajaConNosotros();
    }
    // =====================================================================
    // 1I. PINTADO 100% EDITABLE DE "CONTÁCTANOS" (contacto.html)
    // =====================================================================
    const CONTACTO_PAGINA_DEFECTO = {
        banner_tag: 'CENTRAL DE ATENCIÓN',
        banner_titulo: 'Estamos aquí para ayudarte',
        banner_sub: 'Agenda una consulta reservada con nuestros abogados especialistas en Arequipa o vía virtual.',
        banner_img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        info_tag: 'CANALES DIRECTOS',
        info_titulo: 'Información de Contacto',
        info_desc: 'Atendemos consultas de personas, familias y empresas con rigor técnico y absoluta confidencialidad desde el primer contacto.',
        wa_titulo: 'Atención rápida por WhatsApp',
        wa_sub: 'Escríbenos directamente para coordinar una cita presencial o virtual.',
        privacidad_nota: 'Toda información compartida está protegida bajo secreto profesional y la Ley N.° 29733 de Protección de Datos Personales.',
        form_tag: 'SOLICITUD DE ASESORÍA',
        form_titulo: 'Envíanos tu Consulta Legal',
        form_sub: 'Completa el formulario y un especialista del área correspondiente se pondrá en contacto contigo a la brevedad.',
        form_btn: 'Enviar Solicitud de Asesoría',
        mapa_tag: 'UBICACIÓN DE NUESTRA SEDE',
        mapa_titulo: 'Visítanos en Arequipa',
        mapa_sub: 'Calle 28 de Julio 701, Urb. Vallecito — Arequipa. Atención previa coordinación de cita.',
        mapa_embed_url: 'https://www.google.com/maps?q=Calle+28+de+Julio+701,+Vallecito,+Arequipa,+Peru&output=embed'
    };

    function renderizarPaginaContacto() {
        const banner = document.getElementById('conBanner');
        if (!banner) return;

        const c = Object.assign({}, CONTACTO_PAGINA_DEFECTO, JSON.parse(localStorage.getItem('ureta_pagina_contacto_cache') || '{}'));
        if (c.banner_img) banner.style.backgroundImage = `url('${c.banner_img}')`;

        const mapa = document.getElementById('conMapaIframe');
        if (mapa && c.mapa_embed_url && mapa.src !== c.mapa_embed_url) {
            mapa.src = c.mapa_embed_url;
        }

        // Sincronizar también el enlace de WhatsApp de la tarjeta con configuracion_sitio
        const cfg = JSON.parse(localStorage.getItem('ureta_config_sitio_cache') || '{}');
        const waCard = document.getElementById('contactoWhatsappCard');
        if (waCard && cfg.whatsapp_numero) {
            const num = String(cfg.whatsapp_numero).replace(/\D/g, '');
            waCard.href = `https://api.whatsapp.com/send/?phone=${num}&text=Hola,%20deseo%20solicitar%20asesor%C3%ADa%20legal`;
        }

        const mapaCon = {
            'conBannerTag': c.banner_tag,
            'conBannerTitulo': c.banner_titulo,
            'conBannerSub': c.banner_sub,
            'conInfoTag': c.info_tag,
            'conInfoTitulo': c.info_titulo,
            'conInfoDesc': c.info_desc,
            'conWaTitulo': c.wa_titulo,
            'conWaSub': c.wa_sub,
            'conPrivacidadNota': c.privacidad_nota,
            'conFormTag': c.form_tag,
            'conFormTitulo': c.form_titulo,
            'conFormSub': c.form_sub,
            'conFormBtnTxt': c.form_btn,
            'conMapaTag': c.mapa_tag,
            'conMapaTitulo': c.mapa_titulo,
            'conMapaSub': c.mapa_sub
        };
        Object.entries(mapaCon).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        });

        if (typeof window.poblarAreasContacto === 'function') window.poblarAreasContacto();
    }

    renderizarContenidoGlobalYHome();
    renderizarPaginaNosotros();
    renderizarPaginaAreas();
    renderizarPaginaStaff();
    renderizarPaginaArticulos();
    renderizarPaginaEventos();
    renderizarPaginaTrabaja();
    renderizarPaginaContacto();

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
            }),
            consultarVistaSupabase('eventos_academicos', '?select=*&order=fecha_evento.desc,evento_id.desc').then(filas => {
                if (Array.isArray(filas)) localStorage.setItem('ureta_eventos_db', JSON.stringify(filas));
            }),
            consultarVistaSupabase('historias_carrera', '?select=*&activo=eq.true&order=orden.asc,historia_id.asc').then(filas => {
                if (Array.isArray(filas)) localStorage.setItem('ureta_historias_db', JSON.stringify(filas));
            })
        ]).then(() => {
            renderizarContenidoGlobalYHome();
            renderizarPaginaNosotros();
            renderizarPaginaAreas();
            renderizarPaginaStaff();
            renderizarPaginaArticulos();
            renderizarPaginaEventos();
            renderizarPaginaTrabaja();
            renderizarPaginaContacto();
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
    // =====================================================================
    // 5. ARTÍCULOS JURÍDICOS (blog.html - FILTROS DINÁMICOS Y COMENTARIOS)
    // =====================================================================
    const blogGrid = document.getElementById('blogListadoGrid');
    if (blogGrid) {
        const inputBuscarBlog = document.getElementById('buscarBlogInput');
        const selectCatBlog = document.getElementById('filtroCategoriaBlog');
        const selectTipoBlog = document.getElementById('filtroTipoBlog');
        const destacadoContainer = document.getElementById('blogDestacadoContainer');
        const modalBlog = document.getElementById('modalArticuloBlog');
        const modalBlogContenido = document.getElementById('modalBlogContenido');

        function etiquetaTipoBlog(tipo) {
            if (tipo === 'ArticuloPropio') return 'Artículo Propio';
            if (tipo === 'AnalisisJuridico') return 'Análisis Jurídico';
            return 'Noticia Externa';
        }

        function poblarFiltroCategoriasBlog(articulos) {
            if (!selectCatBlog) return;
            const prev = selectCatBlog.value || 'Todas';
            const txtTodas = window.__articulosTextosUi?.filtro_cat_todas || 'Todas las categorías';
            const categoriasUnicas = [...new Set(articulos.map(a => a.categoria).filter(Boolean))].sort();

            selectCatBlog.innerHTML = `<option value="Todas">${txtTodas}</option>` +
                categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join('');

            if ([...selectCatBlog.options].some(o => o.value === prev)) {
                selectCatBlog.value = prev;
            }
        }

        window.refrescarListadoBlog = function () {
            const articulos = obtenerBlog().filter(p => p.estado === 'Publicado');
            poblarFiltroCategoriasBlog(articulos);

            const ui = window.__articulosTextosUi || ARTICULOS_PAGINA_DEFECTO;
            const dest = articulos.find(p => p.destacado) || articulos[0];

            if (dest && destacadoContainer) {
                destacadoContainer.innerHTML = `
                    <div class="featured-post-card">
                        <div class="featured-post-img" style="background-image: url('${dest.imagen}');"></div>
                        <div class="featured-post-body">
                            <div><span class="badge-tipo">★ ${ui.etiqueta_destacado} • ${etiquetaTipoBlog(dest.tipo)}</span></div>
                            <h2>${dest.titulo}</h2>
                            <p>${dest.subtitulo}</p>
                            <p style="font-size: 0.82rem; color: var(--dorado);">Por: ${dest.autor} | Fecha: ${dest.fecha}</p>
                            <div><button type="button" class="btn btn-gold" onclick="abrirArticuloBlog(${dest.id})">${ui.btn_leer_texto} completo</button></div>
                        </div>
                    </div>
                `;
            } else if (destacadoContainer) {
                destacadoContainer.innerHTML = '';
            }

            const q = (inputBuscarBlog?.value || '').trim().toLowerCase();
            const cat = selectCatBlog?.value || 'Todas';
            const tipo = selectTipoBlog?.value || 'Todos';

            const filtrados = articulos.filter(p =>
                (!q || p.titulo.toLowerCase().includes(q) || (p.subtitulo || '').toLowerCase().includes(q) || (p.autor || '').toLowerCase().includes(q)) &&
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
                        <span class="blog-date"><i class="fa-regular fa-calendar"></i> ${p.fecha} • <strong>${etiquetaTipoBlog(p.tipo)}</strong></span>
                        <h3>${p.titulo}</h3>
                        <p>${p.subtitulo}</p>
                        <button type="button" onclick="abrirArticuloBlog(${p.id})" class="card-link" style="background:none; border:none; cursor:pointer; padding:0;">
                            ${ui.btn_leer_texto} <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </article>
            `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">No se encontraron artículos con ese criterio de búsqueda.</p>`;
        };

        window.abrirArticuloBlog = async function (id) {
            const art = obtenerBlog().find(a => a.id === id);
            if (!art) return;
            const ui = window.__articulosTextosUi || ARTICULOS_PAGINA_DEFECTO;

            modalBlogContenido.innerHTML = `
                <span class="badge-tipo">${art.categoria} • ${etiquetaTipoBlog(art.tipo)}</span>
                <h2 style="font-family: var(--fuente-titulos); font-size: 2rem; margin: 8px 0 10px;">${art.titulo}</h2>
                <p style="font-size: 0.86rem; color: var(--gris-texto); margin-bottom: 20px;">
                    <i class="fa-solid fa-user-pen" style="color:var(--dorado);"></i> Autor: <strong>${art.autor}</strong>  | 
                    <i class="fa-regular fa-calendar" style="color:var(--dorado);"></i> ${art.fecha}
                </p>
                <img src="${art.imagen}" alt="${art.titulo}" style="width:100%; height:300px; object-fit:cover; border-radius:4px; margin-bottom:24px;">
                <div class="article-content-body">${art.contenido || ''}</div>

                ${art.fuenteUrl ? `
                <div class="detail-box highlight-box" style="margin-top: 24px;">
                    <h3><i class="fa-solid fa-arrow-up-right-from-square"></i> Fuente Externa Oficial</h3>
                    <p style="margin-bottom:10px;">Medio: <strong>${art.fuenteNombre || 'Enlace de referencia'}</strong></p>
                    <a href="${art.fuenteUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary-dark">Visitar fuente original</a>
                </div>` : ''}

                <div class="share-bar">
                    <span style="font-size: 0.85rem; font-weight: 700;">Compartir artículo:</span>
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(art.titulo + ' - ' + window.location.href)}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="padding: 8px 14px; font-size:0.8rem;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                    </a>
                </div>

                <div id="listaComentariosArticulo" style="margin-top: 22px;"></div>

                <div class="detail-box" style="margin-top: 24px;">
                    <h3><i class="fa-regular fa-comments"></i> ${ui.comentarios_titulo}</h3>
                    <form onsubmit="enviarComentarioBlog(event, ${art.id})">
                        <div class="form-row-2">
                            <div class="form-group"><input type="text" id="comNombreVisitante" placeholder="Su nombre *" required></div>
                            <div class="form-group"><input type="email" id="comCorreoVisitante" placeholder="Su correo electrónico *" required></div>
                        </div>
                        <div class="form-group"><textarea id="comTextoVisitante" rows="2" placeholder="Escriba su comentario *" required></textarea></div>
                        <button type="submit" class="btn btn-primary-dark">Enviar comentario</button>
                        <p id="msgComentarioEnviado" style="display:none; color:#238d41; font-size:0.84rem; margin-top:8px; font-weight:600;">✓ Comentario enviado para aprobación del equipo editorial.</p>
                    </form>
                </div>
            `;
            modalBlog.classList.add('open');

            // Cargar comentarios aprobados de este artículo desde Supabase
            const comentarios = await consultarVistaSupabase('comentarios_blog', `?publicacion_id=eq.${art.id}&estado=eq.Aprobado&order=fecha_comentario.desc`);
            const contCom = document.getElementById('listaComentariosArticulo');
            if (contCom && Array.isArray(comentarios) && comentarios.length > 0) {
                contCom.innerHTML = `
                    <h4 style="font-family:var(--fuente-titulos); color:#123c2a; margin-bottom:10px;">Comentarios de lectores (${comentarios.length})</h4>
                    ${comentarios.map(c => `
                        <div style="background:#f8fafc; border-left:3px solid #b59a62; padding:12px 14px; border-radius:4px; margin-bottom:10px;">
                            <strong style="color:#123c2a; font-size:0.88rem;">${c.nombre_visitante}</strong>
                            <p style="margin:4px 0 0; font-size:0.88rem; color:#475569;">${c.comentario}</p>
                        </div>
                    `).join('')}
                `;
            }
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
        modalBlog?.addEventListener('click', (e) => {
            if (e.target === modalBlog) modalBlog.classList.remove('open');
        });

        inputBuscarBlog?.addEventListener('input', window.refrescarListadoBlog);
        selectCatBlog?.addEventListener('change', window.refrescarListadoBlog);
        selectTipoBlog?.addEventListener('change', window.refrescarListadoBlog);
        window.refrescarListadoBlog();
    }

    // =====================================================================
    // 6. EVENTOS ACADÉMICOS CON LINK EDITABLE DE FORMS (eventos.html)
    // =====================================================================
    // =====================================================================
    // 6. EVENTOS ACADÉMICOS (eventos.html - DESTACADO, FILTROS Y GOOGLE FORMS)
    // =====================================================================
    const eventosGrid = document.getElementById('eventosListadoGrid');
    if (eventosGrid) {
        const inputBuscarEv = document.getElementById('buscarEventoInput');
        const selectModEv = document.getElementById('filtroModalidadEvento');
        const destEvCont = document.getElementById('eventoDestacadoContainer');
        const modalEv = document.getElementById('modalDetalleEvento');
        const modalEvCont = document.getElementById('modalEventoContenido');

        function obtenerEventosPublicados() {
            const lista = JSON.parse(localStorage.getItem('ureta_eventos_db') || '[]');
            return lista.filter(ev => (ev.estado || 'Publicado') === 'Publicado');
        }

        window.refrescarListadoEventos = function () {
            const eventos = obtenerEventosPublicados();
            const ui = window.__eventosTextosUi || EVENTOS_PAGINA_DEFECTO;

            // Evento destacado superior
            const dest = eventos.find(e => e.destacado) || eventos[0];
            if (dest && destEvCont) {
                const imgDest = dest.imagen_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
                destEvCont.innerHTML = `
                    <div class="featured-post-card">
                        <div class="featured-post-img" style="background-image: url('${imgDest}');"></div>
                        <div class="featured-post-body">
                            <div><span class="badge-tipo">★ ${ui.etiqueta_destacado} • ${dest.modalidad || 'Evento'}</span></div>
                            <h2>${dest.titulo}</h2>
                            <p>${dest.subtitulo || ''}</p>
                            <p style="font-size:0.84rem; color:var(--dorado); margin-bottom:18px;">
                                <i class="fa-regular fa-calendar"></i> ${dest.fecha_evento || 'Por confirmar'}  | 
                                <i class="fa-solid fa-location-dot"></i> ${dest.hora_lugar || 'Sede Institucional'}  | 
                                <i class="fa-solid fa-chalkboard-user"></i> ${dest.ponente || 'Equipo Jurídico'}
                            </p>
                            <div style="display:flex; flex-wrap:wrap; gap:10px;">
                                ${dest.link_inscripcion ? `
                                    <a href="${dest.link_inscripcion}" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                                        <i class="fa-solid fa-pen-to-square"></i> ${ui.btn_inscribir_texto}
                                    </a>` : ''}
                                <button type="button" class="btn btn-outline-light" onclick="abrirModalEvento(${dest.evento_id})">
                                    ${ui.btn_detalle_texto}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (destEvCont) {
                destEvCont.innerHTML = '';
            }

            // Filtros de la grilla
            const q = (inputBuscarEv?.value || '').trim().toLowerCase();
            const mod = selectModEv?.value || 'Todas';

            const filtrados = eventos.filter(ev => {
                const coincideTexto = !q ||
                    (ev.titulo || '').toLowerCase().includes(q) ||
                    (ev.subtitulo || '').toLowerCase().includes(q) ||
                    (ev.categoria || '').toLowerCase().includes(q) ||
                    (ev.ponente || '').toLowerCase().includes(q);
                const coincideMod = mod === 'Todas' || (ev.modalidad || '') === mod;
                return coincideTexto && coincideMod;
            });

            eventosGrid.innerHTML = filtrados.map(ev => {
                const imgCard = ev.imagen_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
                return `
                    <article class="blog-card">
                        <div class="blog-card-img">
                            <span class="blog-category">${ev.categoria || 'Evento Académico'}</span>
                            <img src="${imgCard}" alt="${ev.titulo}">
                        </div>
                        <div class="blog-card-body">
                            <span class="blog-date">
                                <i class="fa-regular fa-calendar"></i> ${ev.fecha_evento || 'Próximamente'} • <strong>${ev.modalidad || ''}</strong>
                            </span>
                            <h3>${ev.titulo}</h3>
                            <p>${ev.subtitulo || ''}</p>
                            <p style="font-size:0.82rem; color:#123c2a; font-weight:600; margin-bottom:14px;">
                                <i class="fa-solid fa-chalkboard-user" style="color:var(--dorado);"></i> ${ev.ponente || ''}<br>
                                <i class="fa-regular fa-clock" style="color:var(--dorado);"></i> ${ev.hora_lugar || ''}
                            </p>
                            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:auto;">
                                <button type="button" onclick="abrirModalEvento(${ev.evento_id})" class="btn btn-primary-dark" style="padding:8px 14px; font-size:0.8rem;">
                                    ${ui.btn_detalle_texto}
                                </button>
                                ${ev.link_inscripcion ? `
                                    <a href="${ev.link_inscripcion}" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="padding:8px 14px; font-size:0.8rem;">
                                        <i class="fa-solid fa-arrow-up-right-from-square"></i> ${ui.btn_inscribir_texto}
                                    </a>` : ''}
                            </div>
                        </div>
                    </article>
                `;
            }).join('') || `<p style="grid-column:1/-1; text-align:center; padding:30px;">No se encontraron eventos académicos con ese criterio.</p>`;
        };

        window.abrirModalEvento = function (id) {
            const ev = obtenerEventosPublicados().find(x => Number(x.evento_id) === Number(id));
            if (!ev) return;
            const ui = window.__eventosTextosUi || EVENTOS_PAGINA_DEFECTO;
            const imgModal = ev.imagen_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';

            modalEvCont.innerHTML = `
                <span class="badge-tipo">${ev.categoria || 'Evento Académico'} • ${ev.modalidad || ''}</span>
                <h2 style="font-family:var(--fuente-titulos); font-size:1.9rem; margin:8px 0 12px; color:#123c2a;">${ev.titulo}</h2>
                <div style="display:flex; flex-wrap:wrap; gap:16px; font-size:0.88rem; color:#475569; margin-bottom:18px;">
                    <span><i class="fa-regular fa-calendar" style="color:var(--dorado);"></i> <strong>Fecha:</strong> ${ev.fecha_evento || 'Por confirmar'}</span>
                    <span><i class="fa-regular fa-clock" style="color:var(--dorado);"></i> <strong>Hora y Lugar:</strong> ${ev.hora_lugar || ''}</span>
                    <span><i class="fa-solid fa-chalkboard-user" style="color:var(--dorado);"></i> <strong>Ponente(s):</strong> ${ev.ponente || ''}</span>
                </div>
                <img src="${imgModal}" alt="${ev.titulo}" style="width:100%; max-height:320px; object-fit:cover; border-radius:6px; margin-bottom:20px;">
                <div class="article-content-body">${ev.descripcion_html || `<p>${ev.subtitulo || ''}</p>`}</div>
                <div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:24px; padding-top:18px; border-top:1px solid #e2e8f0;">
                    ${ev.link_inscripcion ? `
                        <a href="${ev.link_inscripcion}" target="_blank" rel="noopener noreferrer" class="btn btn-gold">
                            <i class="fa-brands fa-google"></i> ${ui.btn_inscribir_texto}
                        </a>` : ''}
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Te invito al evento: ' + ev.titulo + ' - ' + (ev.link_inscripcion || window.location.href))}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
                        <i class="fa-brands fa-whatsapp"></i> Compartir Evento
                    </a>
                </div>
            `;
            modalEv.classList.add('open');
        };

        document.getElementById('cerrarModalEvento')?.addEventListener('click', () => modalEv.classList.remove('open'));
        modalEv?.addEventListener('click', (e) => {
            if (e.target === modalEv) modalEv.classList.remove('open');
        });

        inputBuscarEv?.addEventListener('input', window.refrescarListadoEventos);
        selectModEv?.addEventListener('change', window.refrescarListadoEventos);
        window.refrescarListadoEventos();
    }

    // =====================================================================
    // 7. CONTÁCTANOS (contacto.html)
    // =====================================================================
    // =====================================================================
    // 7. PÁGINA CONTÁCTANOS (SELECTOR DE 9 ÁREAS + ENVÍO A SUPABASE)
    // =====================================================================
    const formContacto = document.getElementById('formContactoPrincipal');
    if (formContacto) {
        const selectAreaCon = document.getElementById('conAreaInteres');
        const areaPreUrl = new URLSearchParams(window.location.search).get('area');

        window.poblarAreasContacto = function () {
            if (!selectAreaCon || typeof obtenerAreasLegales !== 'function') return;
            const prev = selectAreaCon.value;
            const areasActivas = obtenerAreasLegales().filter(a => a.activo);

            selectAreaCon.innerHTML = `<option value="Consulta General">Consulta General</option>` +
                areasActivas.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('');

            if (areaPreUrl && [...selectAreaCon.options].some(o => o.value === areaPreUrl)) {
                selectAreaCon.value = areaPreUrl;
            } else if (prev && [...selectAreaCon.options].some(o => o.value === prev)) {
                selectAreaCon.value = prev;
            }
        };
        window.poblarAreasContacto();

        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnEnviarContacto');
            const alerta = document.getElementById('alertaExitoContacto');
            alerta.style.display = 'none';

            const datosConsulta = {
                nombres: document.getElementById('conNombres').value.trim(),
                correo: document.getElementById('conCorreo').value.trim(),
                telefono: document.getElementById('conTelefono').value.trim(),
                empresa: document.getElementById('conEmpresa').value.trim(),
                area: selectAreaCon ? selectAreaCon.value : 'Consulta General',
                asunto: document.getElementById('conAsunto').value.trim(),
                descripcion: document.getElementById('conDescripcion').value.trim(),
                fecha: new Date().toLocaleString('es-PE'),
                estado: 'Nueva',
                observaciones: ''
            };

            if (btn) btn.disabled = true;

            try {
                if (typeof llamarProcedimiento === 'function' && supabaseEstaConfigurado()) {
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

                const solicitudes = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
                solicitudes.unshift({ id: Date.now(), ...datosConsulta });
                localStorage.setItem('ureta_contactos_db', JSON.stringify(solicitudes));

                formContacto.reset();
                alerta.style.display = 'flex';
            } catch (err) {
                console.error('Error al registrar consulta:', err);
                alert('No se pudo enviar tu consulta. Intenta nuevamente o escríbenos por WhatsApp.');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    // =====================================================================
    // 8. TRABAJA CON NOSOTROS + "DE PRACTICANTE A ABOGADO"
    // =====================================================================
    // =====================================================================
    // 8. TRABAJA CON NOSOTROS (HISTORIAS, VACANTES Y SUBIDA REAL DE CV PDF)
    // =====================================================================
    const vacantesGrid = document.getElementById('vacantesListadoGrid');
    const historiasGrid = document.getElementById('historiasCarreraGrid');

    if (vacantesGrid || historiasGrid) {
        const selectPuesto = document.getElementById('postPuestoSelect');

        window.refrescarTrabajaConNosotros = function () {
            // 1. Pintar historias "De Practicante a Abogado"
            if (historiasGrid) {
                const historias = JSON.parse(localStorage.getItem('ureta_historias_db') || '[]');
                historiasGrid.innerHTML = historias.map(h => `
                    <article class="story-card">
                        <div class="story-photo-wrap">
                            <img src="${h.foto_url}" alt="${h.nombre_completo}">
                            <span class="story-badge-start"><i class="fa-solid fa-seedling"></i> ${h.etapa_inicio || 'Inició como Practicante'}</span>
                        </div>
                        <div class="story-body">
                            <span class="story-role-now">${h.cargo_actual || ''}</span>
                            <h3>${h.nombre_completo || ''}</h3>
                            <p>"${h.historia || ''}"</p>
                        </div>
                    </article>
                `).join('') || `<p style="grid-column:1/-1; text-align:center; padding:20px;">Próximamente compartiremos más historias de crecimiento profesional de nuestro equipo.</p>`;
            }

            // 2. Pintar convocatorias activas + poblar selector sin duplicados
            if (vacantesGrid && typeof obtenerVacantes === 'function') {
                const vacantesActivas = obtenerVacantes().filter(v => v.activa);

                if (selectPuesto) {
                    const prev = selectPuesto.value || 'Postulación Espontánea';
                    selectPuesto.innerHTML = `<option value="Postulación Espontánea">Postulación Espontánea (Base de Talento)</option>` +
                        vacantesActivas.map(v => `<option value="${v.puesto}">${v.puesto} (${v.area})</option>`).join('');
                    if ([...selectPuesto.options].some(o => o.value === prev)) selectPuesto.value = prev;
                }

                vacantesGrid.innerHTML = vacantesActivas.length === 0
                    ? `<p style="grid-column:1/-1; text-align:center; padding:24px;">Actualmente no hay convocatorias abiertas, pero puedes enviarnos tu CV mediante una Postulación Espontánea.</p>`
                    : vacantesActivas.map(v => `
                        <article class="vacancy-card">
                            <span class="staff-role">${v.area || 'Área Jurídica'}</span>
                            <h3 style="font-family: var(--fuente-titulos); font-size: 1.35rem; margin: 6px 0;">${v.puesto}</h3>
                            <div class="vacancy-meta">
                                <span><i class="fa-solid fa-building-user"></i> ${v.modalidad || 'Presencial - Arequipa'}</span>
                                <span><i class="fa-regular fa-calendar"></i> Publicado: ${v.fechaPublicacion || '-'}</span>
                                <span><i class="fa-solid fa-hourglass-half"></i> Cierre: ${v.fechaLimite || 'Abierta'}</span>
                            </div>
                            <p style="font-size: 0.9rem; color: var(--gris-texto); margin-bottom: 14px;">${v.descripcion || ''}</p>
                            <h4 style="font-size: 0.85rem; margin-bottom: 8px; color:#123c2a;">Requisitos principales:</h4>
                            <ul class="check-list" style="margin-bottom: 20px;">
                                ${(v.requisitos || []).map(r => `<li><i class="fa-solid fa-check"></i> <span>${r}</span></li>`).join('')}
                            </ul>
                            <a href="#bloqueFormularioPostulacion" class="btn btn-primary-dark" onclick="postularAVacante('${(v.puesto || '').replace(/'/g, "\\'")}')">
                                Postular a esta convocatoria
                            </a>
                        </article>
                    `).join('');
            }
        };

        window.postularAVacante = function (nombrePuesto) {
            if (selectPuesto) selectPuesto.value = nombrePuesto;
        };

        window.seleccionarPostulacionEspontanea = function () {
            if (selectPuesto) selectPuesto.value = 'Postulación Espontánea';
        };

        window.refrescarTrabajaConNosotros();

        // 3. Envío del Formulario de Postulación + Subida de PDF a Supabase Storage
        const formPostulacion = document.getElementById('formPostulacionTalento');
        if (formPostulacion) {
            formPostulacion.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputCv = document.getElementById('postArchivoCv');
                const errorCv = document.getElementById('errorArchivoCv');
                const alertaExito = document.getElementById('alertaExitoPostulacion');
                const btnEnviar = document.getElementById('btnEnviarPostulacion');

                errorCv.style.display = 'none';
                alertaExito.style.display = 'none';

                const archivo = inputCv?.files[0];
                if (!archivo) return;

                const esPdf = archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf');
                if (!esPdf) {
                    errorCv.textContent = 'Error: Por seguridad, solo se admiten archivos en formato PDF (.pdf).';
                    errorCv.style.display = 'block';
                    return;
                }
                if (archivo.size > 5 * 1024 * 1024) {
                    errorCv.textContent = 'Error: El archivo PDF supera el límite máximo permitido de 5 MB.';
                    errorCv.style.display = 'block';
                    return;
                }

                const datosPost = {
                    puesto: selectPuesto ? selectPuesto.value : 'Postulación Espontánea',
                    nombres: document.getElementById('postNombres').value.trim(),
                    documento: document.getElementById('postDocumento').value.trim(),
                    correo: document.getElementById('postCorreo').value.trim(),
                    telefono: document.getElementById('postTelefono').value.trim(),
                    profesion: document.getElementById('postProfesion').value.trim(),
                    experiencia: document.getElementById('postExperiencia').value.trim(),
                    mensaje: document.getElementById('postMensaje').value.trim()
                };

                if (btnEnviar) {
                    btnEnviar.disabled = true;
                    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo CV en PDF...';
                }

                try {
                    if (typeof subirCvPdfASupabase === 'function' && supabaseEstaConfigurado()) {
                        await subirCvPdfASupabase(archivo, datosPost);
                    }
                    const lista = JSON.parse(localStorage.getItem('ureta_postulaciones_db') || '[]');
                    lista.unshift({
                        id: Date.now(),
                        ...datosPost,
                        nombreArchivoCv: archivo.name,
                        tamanoKb: Math.round(archivo.size / 1024) + ' KB',
                        fecha: new Date().toLocaleString('es-PE'),
                        estado: 'Recibida'
                    });
                    localStorage.setItem('ureta_postulaciones_db', JSON.stringify(lista));

                    formPostulacion.reset();
                    alertaExito.style.display = 'flex';
                } catch (err) {
                    console.error('Error al enviar postulación:', err);
                    errorCv.textContent = 'Ocurrió un problema al subir tu CV. Inténtalo nuevamente.';
                    errorCv.style.display = 'block';
                } finally {
                    if (btnEnviar) {
                        btnEnviar.disabled = false;
                        btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Postulación y CV';
                    }
                }
            });
        }
    }
});