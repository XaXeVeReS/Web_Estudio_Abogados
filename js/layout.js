// =========================================================================
// PÁGINA MAESTRA REUTILIZABLE (HEADER, FOOTER, REDES FLOTANTES Y WHATSAPP)
// =========================================================================
(function () {
    const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
    if (paginaActual === 'admin.html') return;

    // Enlaces oficiales de redes sociales (Edítalos aquí y cambian en toda la web)
    const REDES_ESTUDIO = {
        facebook: 'https://www.facebook.com/estudioureta/',
        instagram: 'https://www.instagram.com/estudio_ureta/',
        twitter: 'https://twitter.com/EstudioUreta',
        linkedin: 'https://www.linkedin.com/'
    };

    function claseActiva(archivo) {
        return paginaActual === archivo ? 'nav-link active' : 'nav-link';
    }

    // 1. Inyectar Barra Superior + Header Maestro
    const headerContainer = document.getElementById('master-header');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div class="top-bar">
                <div class="container top-bar-content">
                    <div class="top-info" style="display: flex; gap: 18px; flex-wrap: wrap; align-items: center;">
                        <span><i class="fa-solid fa-scale-balanced" style="color: var(--dorado);"></i> <strong id="topNombreEstudio">Estudio Jurídico Ureta & Asociados</strong></span>
                        <span><i class="fa-solid fa-location-dot" style="color: var(--dorado);"></i> <span id="topDireccion">Calle 28 de Julio 701, Urb. Vallecito - Arequipa</span></span>
                        <span><i class="fa-solid fa-phone" style="color: var(--dorado);"></i> <span id="topTelefono">(054) 419349 / 980 249 579</span></span>
                    </div>
                    <div class="top-links" style="position: relative; z-index: 1100;">
                        <a href="./admin.html" class="admin-link" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid var(--dorado); border-radius: 4px;">
                            <i class="fa-solid fa-lock"></i> Panel Admin
                        </a>
                    </div>
                </div>
            </div>

            <header class="header" id="header">
                <div class="container nav-container">
                    <a href="index.html" class="logo">
                        <img src="img/logo.png" alt="Estudio Jurídico Ureta & Asociados" class="logo-img-oficial">
                    </a>

                    <button class="menu-toggle" id="menuToggle" aria-label="Abrir menú">
                        <i class="fa-solid fa-bars"></i>
                    </button>

                    <nav class="nav-menu" id="navMenu">
                        <ul class="nav-list">
                            <li><a href="index.html" class="${claseActiva('index.html')}">Inicio</a></li>
                            <li><a href="nosotros.html" class="${claseActiva('nosotros.html')}">Nosotros</a></li>
                            <li class="dropdown" id="areasDropdown">
                                <a href="areas.html" class="${paginaActual === 'areas.html' || paginaActual === 'area-detalle.html' ? 'nav-link dropdown-toggle active' : 'nav-link dropdown-toggle'}">
                                    Nuestras Áreas <i class="fa-solid fa-chevron-down"></i>
                                </a>
                                <ul class="dropdown-menu" id="navAreasDropdownMenu"></ul>
                            </li>
                            <li><a href="staff.html" class="${claseActiva('staff.html')}">Nuestro Staff</a></li>
                            <li><a href="blog.html" class="${claseActiva('blog.html')}">Artículos</a></li>
                            <li><a href="eventos.html" class="${claseActiva('eventos.html')}">Eventos</a></li>
                            <li><a href="trabaja-con-nosotros.html" class="${claseActiva('trabaja-con-nosotros.html')}">Trabaja con nosotros</a></li>
                            <li><a href="contacto.html" class="btn-nav">Contáctanos</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
        `;
    }

    // 2. Inyectar Footer Maestro
    const footerContainer = document.getElementById('master-footer');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer class="footer">
                <div class="container footer-grid">
                    <div class="footer-col">
                        <a href="index.html" class="logo footer-logo">
                            <img src="img/logo.png" alt="Estudio Jurídico Ureta & Asociados" class="logo-img-oficial">
                        </a>
                        <p class="footer-desc">
                            Firma de abogados líder en la Región Sur, dedicada a brindar asesoría legal integral, preventiva y patrocinio estratégico con lealtad, trascendencia y excelencia.
                        </p>
                        <div class="social-links">
                            <a href="${REDES_ESTUDIO.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="${REDES_ESTUDIO.twitter}" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="${REDES_ESTUDIO.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                            <a href="${REDES_ESTUDIO.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
                        </div>
                    </div>

                    <div class="footer-col">
                        <h4>Navegación</h4>
                        <ul class="footer-links">
                            <li><a href="index.html">Inicio</a></li>
                            <li><a href="nosotros.html">Nosotros</a></li>
                            <li><a href="areas.html">Nuestras Áreas</a></li>
                            <li><a href="staff.html">Nuestro Staff</a></li>
                            <li><a href="blog.html">Artículos</a></li>
                            <li><a href="eventos.html">Eventos</a></li>
                            <li><a href="trabaja-con-nosotros.html">Trabaja con nosotros</a></li>
                            <li><a href="contacto.html">Contáctanos</a></li>
                        </ul>
                    </div>

                    <div class="footer-col">
                        <h4>Áreas Jurídicas</h4>
                        <ul class="footer-links" id="footerAreasLinks"></ul>
                    </div>

                    <div class="footer-col">
                        <h4>Central de Atención</h4>
                        <ul class="footer-contact">
                            <li><i class="fa-solid fa-location-dot"></i> <span id="sitioDireccion">Calle 28 de Julio 701, Urb. Vallecito - Arequipa</span></li>
                            <li><i class="fa-solid fa-phone"></i> <span id="sitioTelefono">(054) 419349 / 980 249 579</span></li>
                            <li><i class="fa-solid fa-envelope"></i> <span id="sitioCorreo">contacto@estudio-ureta.com</span></li>
                            <li><i class="fa-regular fa-clock"></i> <span id="sitioHorario">Lunes a Viernes: 8:30 a.m. - 6:00 p.m.</span></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div class="container footer-bottom-content">
                        <p>© 2026 Estudio Jurídico Ureta & Asociados. Todos los derechos reservados.</p>
                        <div class="footer-legal">
                            <a href="contacto.html">Aviso de Privacidad y Protección de Datos Personales</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    // 3. Inyectar Botón Desplegable de Redes Sociales + Botón de WhatsApp (Siempre visible en document.body)
    document.querySelectorAll('.whatsapp-float, .whatsapp-float-btn, #floatingDock').forEach(el => el.remove());

    const dock = document.createElement('div');
    dock.className = 'floating-dock';
    dock.id = 'floatingDock';
    dock.innerHTML = `
        <div class="social-fab-wrapper" id="socialFabWrapper">
            <div class="social-fab-menu" id="socialFabMenu">
                <a href="${REDES_ESTUDIO.facebook}" target="_blank" rel="noopener noreferrer" class="social-fab-item">
                    <span>Facebook</span>
                    <span class="social-fab-icon fb"><i class="fa-brands fa-facebook-f"></i></span>
                </a>
                <a href="${REDES_ESTUDIO.instagram}" target="_blank" rel="noopener noreferrer" class="social-fab-item">
                    <span>Instagram</span>
                    <span class="social-fab-icon ig"><i class="fa-brands fa-instagram"></i></span>
                </a>
                <a href="${REDES_ESTUDIO.twitter}" target="_blank" rel="noopener noreferrer" class="social-fab-item">
                    <span>X / Twitter</span>
                    <span class="social-fab-icon x"><i class="fa-brands fa-x-twitter"></i></span>
                </a>
                <a href="${REDES_ESTUDIO.linkedin}" target="_blank" rel="noopener noreferrer" class="social-fab-item">
                    <span>LinkedIn</span>
                    <span class="social-fab-icon in"><i class="fa-brands fa-linkedin-in"></i></span>
                </a>
            </div>
            <button type="button" class="social-fab-toggle" id="btnToggleRedes" aria-label="Mostrar redes sociales del estudio" title="Redes Sociales">
                <i class="fa-solid fa-share-nodes"></i>
            </button>
        </div>

        <a href="https://api.whatsapp.com/send/?phone=51980249579&text=Hola,%20deseo%20realizar%20una%20consulta%20legal" target="_blank" rel="noopener noreferrer" class="whatsapp-float-pro" id="btnWhatsappFloat" aria-label="Consultar por WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
            <span>Consulta por WhatsApp</span>
        </a>
    `;
    document.body.appendChild(dock);

    // Lógica de abrir y cerrar el menú de redes sociales
    const socialWrapper = document.getElementById('socialFabWrapper');
    const btnToggleRedes = document.getElementById('btnToggleRedes');

    if (socialWrapper && btnToggleRedes) {
        btnToggleRedes.addEventListener('click', (e) => {
            e.stopPropagation();
            const abierto = socialWrapper.classList.toggle('open');
            btnToggleRedes.innerHTML = abierto
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-share-nodes"></i>';
        });

        document.addEventListener('click', (e) => {
            if (!socialWrapper.contains(e.target) && socialWrapper.classList.contains('open')) {
                socialWrapper.classList.remove('open');
                btnToggleRedes.innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
            }
        });
    }

    // 4. Activar menú móvil
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const areasDropdown = document.getElementById('areasDropdown');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
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

    // 5. Sincronizar áreas, datos de contacto y número de WhatsApp desde Supabase
    window.actualizarLayoutMaestro = function () {
        if (typeof obtenerAreasLegales === 'function') {
            const areasActivas = obtenerAreasLegales().filter(a => a.activo);
            const navDropdown = document.getElementById('navAreasDropdownMenu');
            const footerAreas = document.getElementById('footerAreasLinks');

            if (navDropdown && areasActivas.length > 0) {
                navDropdown.innerHTML = areasActivas.map(a =>
                    `<li><a href="area-detalle.html?area=${a.slug}">${a.nombre}</a></li>`
                ).join('');
            }
            if (footerAreas && areasActivas.length > 0) {
                footerAreas.innerHTML = areasActivas.slice(0, 6).map(a =>
                    `<li><a href="area-detalle.html?area=${a.slug}">${a.nombre}</a></li>`
                ).join('') + `<li><a href="areas.html">Ver las ${areasActivas.length} especialidades →</a></li>`;
            }
        }

        const cfg = JSON.parse(localStorage.getItem('ureta_config_cache') || 'null');
        if (cfg) {
            const campos = {
                'topNombreEstudio': cfg.nombre_estudio,
                'topDireccion': cfg.direccion_fisica,
                'sitioDireccion': cfg.direccion_fisica,
                'topTelefono': cfg.telefono_principal,
                'sitioTelefono': cfg.telefono_principal,
                'sitioCorreo': cfg.correo_contacto,
                'sitioHorario': cfg.horario_atencion
            };
            Object.entries(campos).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.textContent = val;
            });

            if (cfg.whatsapp_numero) {
                let numLimpio = cfg.whatsapp_numero.replace(/\D/g, '');
                if (numLimpio.length === 9) numLimpio = '51' + numLimpio;
                const urlWa = `https://api.whatsapp.com/send/?phone=${numLimpio}&text=Hola,%20deseo%20realizar%20una%20consulta%20legal`;

                document.querySelectorAll('#btnWhatsappFloat, .btn-whatsapp, a[href*="api.whatsapp.com"]').forEach(link => {
                    link.href = urlWa;
                });
            }
        }
    };

    window.actualizarLayoutMaestro();
})();