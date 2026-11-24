document.addEventListener('DOMContentLoaded', () => {

    // Cachés en memoria para edición rápida de todos los módulos
    let cachePortadas = [];
    let cacheTestimonios = [];
    let cacheComentariosBlog = [];
    let cacheUsuariosAdmin = [];

    // =========================================================
    // 1. LOGIN DE ADMINISTRADOR (sp_login_usuario_admin)
    // =========================================================
    const loginScreen = document.getElementById('adminLoginScreen');
    const appLayout = document.getElementById('adminAppLayout');
    const formLogin = document.getElementById('formLoginAdmin');

    if (sessionStorage.getItem('ureta_admin_logged') === 'true') {
        loginScreen.style.display = 'none';
        appLayout.style.display = 'grid';
        inicializarPanelConSupabase();
    }

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        let accesoValido = false;

        if (typeof llamarProcedimiento === 'function' && supabaseEstaConfigurado()) {
            const respLogin = await llamarProcedimiento('sp_login_usuario_admin', {
                p_email: email,
                p_password: pass
            });
            if (respLogin && respLogin.autenticado) {
                accesoValido = true;
                document.getElementById('adminNombreUsuario').innerHTML = `<i class="fa-solid fa-user-shield"></i> ${respLogin.nombre} (${respLogin.rol})`;
            }
        }

        if (email === 'admin@estudio-ureta.com' && pass === 'Ureta2026*') {
            accesoValido = true;
        }

        if (accesoValido) {
            sessionStorage.setItem('ureta_admin_logged', 'true');
            loginScreen.style.display = 'none';
            appLayout.style.display = 'grid';
            inicializarPanelConSupabase();
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        sessionStorage.removeItem('ureta_admin_logged');
        window.location.reload();
    });

    // =========================================================
    // 2. NAVEGACIÓN ENTRE TODOS LOS MÓDULOS DEL PANEL
    // =========================================================
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');
    const tituloSeccion = document.getElementById('adminSeccionTitulo');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-tab');
            const panelDestino = document.getElementById(target);
            if (panelDestino) panelDestino.classList.add('active');
            tituloSeccion.textContent = btn.textContent.trim();
        });
    });

    // =========================================================
    // 3. SINCRONIZAR Y RENDERIZAR TODOS LOS MÓDULOS DESDE SUPABASE
    // =========================================================
    async function inicializarPanelConSupabase() {
        if (typeof sincronizarVistasSupabase === 'function' && supabaseEstaConfigurado()) {
            await sincronizarVistasSupabase();
        }
        await cargarTodoElPanel();
    }

    async function cargarTodoElPanel() {
        const areas = obtenerAreasLegales();
        const staff = obtenerStaff();
        const blog = obtenerBlog();
        const vacantes = obtenerVacantes();
        const contactos = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
        const postulaciones = JSON.parse(localStorage.getItem('ureta_postulaciones_db') || '[]');

        if (typeof consultarVistaSupabase === 'function' && supabaseEstaConfigurado()) {
            cachePortadas = (await consultarVistaSupabase('vw_portadas_activas')) || [];
            cacheTestimonios = (await consultarVistaSupabase('vw_testimonios_completos')) || [];
            cacheComentariosBlog = (await consultarVistaSupabase('vw_comentarios_blog_detalle')) || [];
            cacheUsuariosAdmin = (await consultarVistaSupabase('vw_usuarios_admin_listado')) || [];

            const configArr = await consultarVistaSupabase('configuracion_sitio', '?select=*&limit=1');
            if (configArr && configArr[0]) {
                const cfg = configArr[0];
                document.getElementById('cfgNombreEstudio').value = cfg.nombre_estudio || '';
                document.getElementById('cfgFrase').value = cfg.frase_institucional || '';
                document.getElementById('cfgDireccion').value = cfg.direccion_fisica || '';
                document.getElementById('cfgTelefono').value = cfg.telefono_principal || '';
                document.getElementById('cfgWhatsapp').value = cfg.whatsapp_numero || '';
                document.getElementById('cfgCorreo').value = cfg.correo_contacto || '';
                document.getElementById('cfgHorario').value = cfg.horario_atencion || '';
                document.getElementById('cfgHistoria').value = cfg.historia_institucional || '';
                document.getElementById('cfgMision').value = cfg.mision || '';
                document.getElementById('cfgVision').value = cfg.vision || '';
            }
        }

        // KPIs del Dashboard
        if (typeof llamarProcedimiento === 'function' && supabaseEstaConfigurado()) {
            const kpis = await llamarProcedimiento('sp_obtener_dashboard_kpis');
            if (kpis) {
                document.getElementById('kpiTotalAreas').textContent = kpis.total_areas ?? areas.filter(a => a.activo).length;
                document.getElementById('kpiTotalAbogados').textContent = kpis.total_abogados ?? staff.filter(s => s.activo).length;
                document.getElementById('kpiTotalBlog').textContent = kpis.total_publicaciones ?? blog.filter(b => b.estado === 'Publicado').length;
                document.getElementById('kpiComentariosPendientes').textContent = kpis.comentarios_pendientes ?? 0;
                document.getElementById('kpiTotalContactos').textContent = kpis.consultas_recibidas ?? contactos.length;
                document.getElementById('kpiTotalPostulaciones').textContent = kpis.postulaciones_recibidas ?? postulaciones.length;
                document.getElementById('kpiTotalVacantes').textContent = kpis.vacantes_activas ?? vacantes.filter(v => v.activa).length;
            }
        }

        // 1. Portadas
        document.getElementById('tablaAdminPortadas').innerHTML = cachePortadas.map((p, idx) => `
            <tr>
                <td><strong>#${p.orden}</strong></td>
                <td><img src="${p.imagen_url}" alt="Portada" style="width:90px; height:48px; object-fit:cover; border-radius:3px;"></td>
                <td><strong>${p.titulo}</strong><br><small style="color:var(--dorado);">${p.subtitulo || ''}</small></td>
                <td><span class="badge-status ${p.publicado ? 'badge-active' : 'badge-hidden'}">${p.publicado ? 'Publicada' : 'Oculta'}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionPortada(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="alternarEstadoPortada(${p.portada_id}, ${!p.publicado})">${p.publicado ? 'Ocultar' : 'Activar'}</button>
                    <button class="btn-sm-action" onclick="borrarPortada(${p.portada_id})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="5" style="text-align:center;">No hay portadas registradas.</td></tr>`;

        // 2. Áreas Legales (9 especialidades)
        document.getElementById('tablaAdminAreas').innerHTML = areas.map((a, idx) => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${a.imagen}" alt="${a.nombre}" style="width:46px; height:36px; object-fit:cover; border-radius:4px;">
                        <strong><i class="${a.icono}" style="color:var(--dorado); margin-right:6px;"></i>${a.nombre}</strong>
                    </div>
                </td>
                <td>${a.resumen}</td>
                <td><span class="badge-status ${a.activo ? 'badge-active' : 'badge-hidden'}">${a.activo ? 'Activa' : 'Oculta'}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionArea(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="alternarEstadoArea(${idx})">${a.activo ? 'Ocultar' : 'Activar'}</button>
                    <button class="btn-sm-action" onclick="eliminarArea(${idx})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // 3. Abogados (Staff)
        document.getElementById('tablaAdminStaff').innerHTML = staff.map((s, idx) => `
            <tr>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.cargo}<br><small>${s.colegiatura || ''}</small></td>
                <td>${(s.especialidades || []).join(', ')}</td>
                <td><span class="badge-status ${s.activo ? 'badge-active' : 'badge-hidden'}">${s.activo ? 'Visible' : 'Oculto'}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionStaff(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="alternarEstadoStaff(${idx})">${s.activo ? 'Ocultar' : 'Activar'}</button>
                    <button class="btn-sm-action" onclick="eliminarStaff(${idx})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // 4. Artículos Jurídicos (Blog)
        document.getElementById('tablaAdminBlog').innerHTML = blog.map((b, idx) => `
            <tr>
                <td><strong>${b.destacado ? '★ ' : ''}${b.titulo}</strong></td>
                <td>${b.categoria} <br><small>(${b.tipo})</small></td>
                <td>${b.autor}</td>
                <td><span class="badge-status ${b.estado === 'Publicado' ? 'badge-active' : 'badge-hidden'}">${b.estado}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionBlog(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="alternarEstadoBlog(${idx})">${b.estado === 'Publicado' ? 'Archivar' : 'Publicar'}</button>
                    <button class="btn-sm-action" onclick="eliminarBlog(${idx})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // 5. Testimonios y Comentarios
        document.getElementById('tablaAdminTestimonios').innerHTML = cacheTestimonios.map((t, idx) => `
            <tr>
                <td><strong>${t.identificacion_cliente}</strong><br><small>${t.cargo_o_tipo_cliente || ''}</small></td>
                <td>"${t.comentario}"</td>
                <td><span class="badge-status ${t.estado === 'Aprobado' ? 'badge-active' : 'badge-hidden'}">${t.estado} ${t.destacado ? '★' : ''}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionTestimonio(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="cambiarEstadoTestimonio(${t.testimonio_id}, 'Aprobado', true)">Aprobar</button>
                    <button class="btn-sm-action" onclick="cambiarEstadoTestimonio(${t.testimonio_id}, 'Rechazado', false)">Rechazar</button>
                    <button class="btn-sm-action" onclick="borrarTestimonio(${t.testimonio_id})" style="color:#dc2626;">Borrar</button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="4" style="text-align:center;">No hay testimonios registrados.</td></tr>`;

        document.getElementById('tablaAdminComentariosBlog').innerHTML = cacheComentariosBlog.map(c => `
            <tr>
                <td>${new Date(c.fecha_comentario).toLocaleDateString('es-PE')}</td>
                <td><strong>${c.titulo_articulo}</strong></td>
                <td>${c.nombre_visitante}<br><small>${c.correo_visitante}</small></td>
                <td>${c.comentario}</td>
                <td><span class="badge-status ${c.estado === 'Aprobado' ? 'badge-active' : 'badge-hidden'}">${c.estado}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="moderarComentarioBlog(${c.comentario_id}, 'Aprobado')">Aprobar</button>
                    <button class="btn-sm-action" onclick="moderarComentarioBlog(${c.comentario_id}, 'Rechazado')">Rechazar</button>
                    <button class="btn-sm-action" onclick="borrarComentarioBlog(${c.comentario_id})" style="color:#dc2626;">Borrar</button>
                </td>
            </tr>
        `).join('') || `<tr><td colspan="6" style="text-align:center;">No hay comentarios en artículos.</td></tr>`;

        // 6. Consultas Recibidas
        const tbodyContactos = document.getElementById('tablaAdminContactos');
        if (contactos.length === 0) {
            tbodyContactos.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se han recibido consultas todavía.</td></tr>`;
        } else {
            tbodyContactos.innerHTML = contactos.map((c, idx) => `
                <tr>
                    <td>${c.fecha}</td>
                    <td><strong>${c.nombres}</strong><br><small>${c.telefono} | ${c.correo}</small><br><small>${c.empresa || ''}</small></td>
                    <td><strong>${c.area}</strong><br><small>${c.asunto}</small></td>
                    <td>
                        <p style="margin-bottom:6px;">${c.descripcion}</p>
                        <input type="text" id="obsContacto_${idx}" value="${c.observaciones || ''}" placeholder="Añadir observación interna..." style="width:100%; padding:5px 8px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:3px;">
                    </td>
                    <td>
                        <select id="estContacto_${idx}" style="padding:5px; font-size:0.78rem; border-radius:3px;">
                            <option value="Nueva" ${c.estado === 'Nueva' ? 'selected' : ''}>Nueva</option>
                            <option value="EnRevision" ${c.estado === 'EnRevision' ? 'selected' : ''}>En Revisión</option>
                            <option value="Atendida" ${c.estado === 'Atendida' ? 'selected' : ''}>Atendida</option>
                            <option value="Archivada" ${c.estado === 'Archivada' ? 'selected' : ''}>Archivada</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-sm-action" onclick="guardarGestionContacto(${idx})"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
                        <button class="btn-sm-action" onclick="eliminarContacto(${idx})" style="color:#dc2626;">Borrar</button>
                    </td>
                </tr>
            `).join('');
        }

        // 7. Postulaciones y CVs
        const tbodyPost = document.getElementById('tablaAdminPostulaciones');
        if (postulaciones.length === 0) {
            tbodyPost.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay postulaciones registradas todavía.</td></tr>`;
        } else {
            tbodyPost.innerHTML = postulaciones.map((p, idx) => `
                <tr>
                    <td>${p.fecha}</td>
                    <td><strong>${p.nombres}</strong><br><small>Doc: ${p.documento} | ${p.telefono}</small></td>
                    <td>${p.puesto}</td>
                    <td><strong>${p.profesion}</strong><br><small>${p.experiencia}</small></td>
                    <td>
                        <a href="${p.url_archivo_cv || '#'}" target="_blank" style="color:#dc2626; font-weight:700;">
                            <i class="fa-solid fa-file-pdf"></i> ${p.nombreArchivoCv} (${p.tamanoKb})
                        </a>
                    </td>
                    <td>
                        <select onchange="cambiarEstadoPostulacion(${idx}, this.value)" style="padding:5px; font-size:0.78rem; border-radius:3px;">
                            <option value="Recibida" ${p.estado === 'Recibida' ? 'selected' : ''}>Recibida</option>
                            <option value="EnEvaluacion" ${p.estado === 'EnEvaluacion' ? 'selected' : ''}>En Evaluación</option>
                            <option value="Entrevista" ${p.estado === 'Entrevista' ? 'selected' : ''}>Entrevista</option>
                            <option value="Finalista" ${p.estado === 'Finalista' ? 'selected' : ''}>Finalista</option>
                            <option value="Descartada" ${p.estado === 'Descartada' ? 'selected' : ''}>Descartada</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-sm-action" onclick="eliminarPostulacion(${idx})" style="color:#dc2626;">Borrar</button>
                    </td>
                </tr>
            `).join('');
        }

        // 8. Vacantes / Practicantes
        document.getElementById('tablaAdminVacantes').innerHTML = vacantes.map((v, idx) => `
            <tr>
                <td><strong>${v.puesto}</strong></td>
                <td>${v.area}</td>
                <td>${v.modalidad}</td>
                <td>${v.fechaLimite}</td>
                <td><span class="badge-status ${v.activa ? 'badge-active' : 'badge-hidden'}">${v.activa ? 'Abierta' : 'Cerrada'}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionVacante(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="alternarVacante(${idx})">${v.activa ? 'Cerrar' : 'Reabrir'}</button>
                    <button class="btn-sm-action" onclick="eliminarVacante(${idx})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // 10. Usuarios Administradores
        document.getElementById('tablaAdminUsuarios').innerHTML = cacheUsuariosAdmin.map((u, idx) => `
            <tr>
                <td>#${u.usuario_id}</td>
                <td><strong>${u.nombre_completo}</strong></td>
                <td>${u.email}</td>
                <td>${u.rol_nombre}</td>
                <td><span class="badge-status ${u.activo ? 'badge-active' : 'badge-hidden'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="cargarEdicionUsuario(${idx})"><i class="fa-solid fa-pen"></i> Editar</button>
                    ${u.usuario_id !== 1 ? `
                        <button class="btn-sm-action" onclick="cambiarEstadoUsuario(${u.usuario_id}, ${!u.activo})">${u.activo ? 'Desactivar' : 'Activar'}</button>
                        <button class="btn-sm-action" onclick="borrarUsuarioAdmin(${u.usuario_id})" style="color:#dc2626;">Eliminar</button>
                    ` : '<small style="color:var(--gris-texto);">Principal</small>'}
                </td>
            </tr>
        `).join('') || `<tr><td colspan="6" style="text-align:center;">Conectado con usuario administrador principal.</td></tr>`;
    }

    // =========================================================
    // 4. FUNCIONES PARA CARGAR DATOS EN EL FORMULARIO AL DAR CLIC EN "EDITAR"
    // =========================================================

    window.cargarEdicionPortada = function(idx) {
        const p = cachePortadas[idx];
        if (!p) return;
        document.getElementById('portadaIdEdit').value = p.portada_id;
        document.getElementById('portadaTitulo').value = p.titulo || '';
        document.getElementById('portadaSubtitulo').value = p.subtitulo || '';
        document.getElementById('portadaDescripcion').value = p.descripcion_breve || '';
        document.getElementById('portadaImagenUrl').value = p.imagen_url || '';
        document.getElementById('portadaBtn1Texto').value = p.texto_boton_1 || 'Conoce nuestros servicios';
        document.getElementById('portadaBtn1Url').value = p.url_boton_1 || 'areas.html';
        document.getElementById('portadaBtn2Texto').value = p.texto_boton_2 || 'Solicita una asesoría';
        document.getElementById('portadaOrden').value = p.orden || 1;
        document.getElementById('tituloFormPortada').textContent = `Editando Portada #${p.portada_id}: ${p.titulo}`;
        document.getElementById('btnCancelarPortada').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarPortada').addEventListener('click', () => {
        document.getElementById('formPortada').reset();
        document.getElementById('portadaIdEdit').value = '';
        document.getElementById('tituloFormPortada').textContent = 'Registrar / Editar Portada Principal (Hero)';
        document.getElementById('btnCancelarPortada').style.display = 'none';
    });

    window.cargarEdicionArea = function(idx) {
        const a = obtenerAreasLegales()[idx];
        if (!a) return;
        document.getElementById('areaIdEdit').value = a.id || '';
        document.getElementById('areaNuevoNombre').value = a.nombre || '';
        document.getElementById('areaNuevoIcono').value = a.icono || 'fa-solid fa-scale-balanced';
        document.getElementById('areaNuevaImg').value = a.imagen || '';
        document.getElementById('areaNuevoResumen').value = a.resumen || '';
        document.getElementById('areaNuevaDesc').value = a.descripcion || '';
        document.getElementById('areaNuevosServicios').value = (a.servicios || []).join('\n');
        document.getElementById('areaNuevasSituaciones').value = (a.situaciones || []).join('\n');
        document.getElementById('tituloFormArea').textContent = `Editando Especialidad: ${a.nombre}`;
        document.getElementById('btnCancelarArea').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarArea').addEventListener('click', () => {
        document.getElementById('formNuevaArea').reset();
        document.getElementById('areaIdEdit').value = '';
        document.getElementById('tituloFormArea').textContent = 'Registrar / Editar Especialidad Jurídica';
        document.getElementById('btnCancelarArea').style.display = 'none';
    });

    window.cargarEdicionStaff = function(idx) {
        const s = obtenerStaff()[idx];
        if (!s) return;
        document.getElementById('abIdEdit').value = s.id || '';
        document.getElementById('abNombre').value = s.nombre || '';
        document.getElementById('abCargo').value = s.cargo || '';
        document.getElementById('abColegiatura').value = s.colegiatura || '';
        document.getElementById('abCorreo').value = s.correo || 'contacto@estudio-ureta.com';
        document.getElementById('abFoto').value = s.foto || '';
        document.getElementById('abEspecialidades').value = (s.especialidades || []).join(', ');
        document.getElementById('abFormacion').value = s.formacion || '';
        document.getElementById('abExperiencia').value = s.experiencia || '';
        document.getElementById('abCursos').value = s.cursos || '';
        document.getElementById('abBiografia').value = s.biografia || '';
        document.getElementById('tituloFormStaff').textContent = `Editando Perfil de: ${s.nombre}`;
        document.getElementById('btnCancelarAbogado').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarAbogado').addEventListener('click', () => {
        document.getElementById('formNuevoAbogado').reset();
        document.getElementById('abIdEdit').value = '';
        document.getElementById('tituloFormStaff').textContent = 'Registrar / Editar Abogado del Staff';
        document.getElementById('btnCancelarAbogado').style.display = 'none';
    });

    window.cargarEdicionBlog = function(idx) {
        const b = obtenerBlog()[idx];
        if (!b) return;
        document.getElementById('blogIdEdit').value = b.id || '';
        document.getElementById('blogTitulo').value = b.titulo || '';
        document.getElementById('blogAutor').value = b.autor || '';
        document.getElementById('blogCategoria').value = b.categoria || 'Opinión jurídica';
        document.getElementById('blogTipo').value = b.tipo || 'ArticuloPropio';
        document.getElementById('blogImagen').value = b.imagen || '';
        document.getElementById('blogFuenteNombre').value = b.fuenteNombre || '';
        document.getElementById('blogFuenteUrl').value = b.fuenteUrl || '';
        document.getElementById('blogEstado').value = b.estado || 'Publicado';
        document.getElementById('blogDestacado').checked = Boolean(b.destacado);
        document.getElementById('blogSubtitulo').value = b.subtitulo || '';
        document.getElementById('blogContenido').value = (b.contenido || '').replace(/<\/?p>/g, '');
        document.getElementById('tituloFormBlog').textContent = `Editando Artículo: ${b.titulo}`;
        document.getElementById('btnCancelarBlog').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarBlog').addEventListener('click', () => {
        document.getElementById('formNuevoBlog').reset();
        document.getElementById('blogIdEdit').value = '';
        document.getElementById('tituloFormBlog').textContent = 'Crear / Editar Artículo Jurídico';
        document.getElementById('btnCancelarBlog').style.display = 'none';
    });

    window.cargarEdicionTestimonio = function(idx) {
        const t = cacheTestimonios[idx];
        if (!t) return;
        document.getElementById('testimonioIdEdit').value = t.testimonio_id;
        document.getElementById('testCliente').value = t.identificacion_cliente || '';
        document.getElementById('testCargo').value = t.cargo_o_tipo_cliente || '';
        document.getElementById('testEstado').value = t.estado || 'Aprobado';
        document.getElementById('testDestacado').checked = Boolean(t.destacado);
        document.getElementById('testComentario').value = t.comentario || '';
        document.getElementById('tituloFormTestimonio').textContent = `Editando Testimonio de: ${t.identificacion_cliente}`;
        document.getElementById('btnCancelarTestimonio').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarTestimonio').addEventListener('click', () => {
        document.getElementById('formTestimonio').reset();
        document.getElementById('testimonioIdEdit').value = '';
        document.getElementById('tituloFormTestimonio').textContent = 'Registrar / Editar Testimonio de Cliente';
        document.getElementById('btnCancelarTestimonio').style.display = 'none';
    });

    window.cargarEdicionVacante = function(idx) {
        const v = obtenerVacantes()[idx];
        if (!v) return;
        document.getElementById('vacIdEdit').value = v.id || '';
        document.getElementById('vacPuesto').value = v.puesto || '';
        document.getElementById('vacArea').value = v.area || '';
        document.getElementById('vacModalidad').value = v.modalidad || '';
        document.getElementById('vacFechaLimite').value = v.fechaLimite || '';
        document.getElementById('vacDescripcion').value = v.descripcion || '';
        document.getElementById('vacRequisitos').value = (v.requisitos || []).join('\n');
        document.getElementById('tituloFormVacante').textContent = `Editando Convocatoria: ${v.puesto}`;
        document.getElementById('btnCancelarVacante').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarVacante').addEventListener('click', () => {
        document.getElementById('formNuevaVacante').reset();
        document.getElementById('vacIdEdit').value = '';
        document.getElementById('tituloFormVacante').textContent = 'Publicar / Editar Convocatoria para Practicantes';
        document.getElementById('btnCancelarVacante').style.display = 'none';
    });

    window.cargarEdicionUsuario = function(idx) {
        const u = cacheUsuariosAdmin[idx];
        if (!u) return;
        document.getElementById('userIdEdit').value = u.usuario_id;
        document.getElementById('userNombre').value = u.nombre_completo || '';
        document.getElementById('userEmail').value = u.email || '';
        document.getElementById('userRolId').value = u.rol_id || 1;
        document.getElementById('userPassword').value = '';
        document.getElementById('tituloFormUsuario').textContent = `Editando Usuario: ${u.nombre_completo}`;
        document.getElementById('btnCancelarUsuario').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('btnCancelarUsuario').addEventListener('click', () => {
        document.getElementById('formUsuarioAdmin').reset();
        document.getElementById('userIdEdit').value = '';
        document.getElementById('tituloFormUsuario').textContent = 'Registrar / Editar Usuario Administrador';
        document.getElementById('btnCancelarUsuario').style.display = 'none';
    });

    // =========================================================
    // 5. ENVÍO DE TODOS LOS FORMULARIOS (CREAR Y EDITAR EN SUPABASE)
    // =========================================================

    // 1. Portada
    document.getElementById('formPortada').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('portadaIdEdit').value ? parseInt(document.getElementById('portadaIdEdit').value) : null;
        let urlImagen = document.getElementById('portadaImagenUrl').value.trim();
        const archivoImg = document.getElementById('portadaArchivoImg')?.files[0];

        if (archivoImg && typeof subirArchivoStorageSupabase === 'function') {
            const subida = await subirArchivoStorageSupabase('imagenes_sitio', archivoImg);
            if (subida) urlImagen = subida;
        }

        await llamarProcedimiento('sp_guardar_portada', {
            p_portada_id: idEdit,
            p_titulo: document.getElementById('portadaTitulo').value.trim(),
            p_subtitulo: document.getElementById('portadaSubtitulo').value.trim(),
            p_descripcion: document.getElementById('portadaDescripcion').value.trim(),
            p_texto_boton_1: document.getElementById('portadaBtn1Texto').value.trim(),
            p_url_boton_1: document.getElementById('portadaBtn1Url').value.trim(),
            p_texto_boton_2: document.getElementById('portadaBtn2Texto').value.trim(),
            p_url_boton_2: 'contacto.html',
            p_url_imagen: urlImagen,
            p_orden: parseInt(document.getElementById('portadaOrden').value) || 1
        });

        document.getElementById('btnCancelarPortada').click();
        await inicializarPanelConSupabase();
    });

    // 2. Área Legal (Incluye PATCH directo para que las imágenes subidas desde PC se actualicen al instante)
    document.getElementById('formNuevaArea').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('areaIdEdit').value ? parseInt(document.getElementById('areaIdEdit').value) : null;
        const nombre = document.getElementById('areaNuevoNombre').value.trim();
        const icono = document.getElementById('areaNuevoIcono').value.trim() || 'fa-solid fa-scale-balanced';
        let imagen = document.getElementById('areaNuevaImg').value.trim();
        const archivoImg = document.getElementById('areaArchivoImg')?.files[0];

        if (archivoImg && typeof subirArchivoStorageSupabase === 'function') {
            const subida = await subirArchivoStorageSupabase('imagenes_sitio', archivoImg);
            if (subida) imagen = subida;
        }

        const resumen = document.getElementById('areaNuevoResumen').value.trim();
        const descripcion = document.getElementById('areaNuevaDesc').value.trim();
        const servicios = document.getElementById('areaNuevosServicios').value.split('\n').map(s => s.trim()).filter(Boolean);
        const situaciones = document.getElementById('areaNuevasSituaciones').value.split('\n').map(s => s.trim()).filter(Boolean);

        await llamarProcedimiento('sp_guardar_area_legal', {
            p_area_id: idEdit,
            p_nombre: nombre,
            p_icono: icono,
            p_url_imagen: imagen,
            p_resumen: resumen,
            p_descripcion: descripcion,
            p_servicios: servicios,
            p_situaciones: situaciones,
            p_orden: 1
        });

        // Forzar actualización de la imagen directa en la tabla areas_legales
        if (imagen && typeof supabaseRest === 'function') {
            const filtro = idEdit ? `?area_id=eq.${idEdit}` : `?nombre=eq.${encodeURIComponent(nombre)}`;
            await supabaseRest('areas_legales', 'PATCH', filtro, {
                imagen_id: null,
                url_imagen_directa: imagen
            });
        }

        document.getElementById('btnCancelarArea').click();
        await inicializarPanelConSupabase();
    });

    // 3. Abogado
    document.getElementById('formNuevoAbogado').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('abIdEdit').value ? parseInt(document.getElementById('abIdEdit').value) : null;
        let foto = document.getElementById('abFoto').value.trim();
        const archivoFoto = document.getElementById('abArchivoFoto')?.files[0];

        if (archivoFoto && typeof subirArchivoStorageSupabase === 'function') {
            const subida = await subirArchivoStorageSupabase('imagenes_sitio', archivoFoto);
            if (subida) foto = subida;
        }

        const especialidades = document.getElementById('abEspecialidades').value.split(',').map(s => s.trim()).filter(Boolean);

        await llamarProcedimiento('sp_guardar_abogado', {
            p_abogado_id: idEdit,
            p_nombre: document.getElementById('abNombre').value.trim(),
            p_cargo: document.getElementById('abCargo').value.trim(),
            p_colegiatura: document.getElementById('abColegiatura').value.trim(),
            p_foto_url: foto,
            p_formacion: document.getElementById('abFormacion').value.trim(),
            p_experiencia: document.getElementById('abExperiencia').value.trim(),
            p_cursos: document.getElementById('abCursos').value.trim(),
            p_biografia: document.getElementById('abBiografia').value.trim(),
            p_correo: document.getElementById('abCorreo').value.trim(),
            p_nombres_areas: especialidades
        });

        document.getElementById('btnCancelarAbogado').click();
        await inicializarPanelConSupabase();
    });

    // 4. Artículos Jurídicos (Blog)
    document.getElementById('formNuevoBlog').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('blogIdEdit').value ? parseInt(document.getElementById('blogIdEdit').value) : null;
        let imagen = document.getElementById('blogImagen').value.trim();
        const archivoImg = document.getElementById('blogArchivoImg')?.files[0];

        if (archivoImg && typeof subirArchivoStorageSupabase === 'function') {
            const subida = await subirArchivoStorageSupabase('imagenes_sitio', archivoImg);
            if (subida) imagen = subida;
        }

        const textoContenido = document.getElementById('blogContenido').value.trim();
        const contenidoHtml = textoContenido.startsWith('<') ? textoContenido : `<p>${textoContenido.replace(/\n+/g, '</p><p>')}</p>`;

        await llamarProcedimiento('sp_guardar_publicacion_blog', {
            p_publicacion_id: idEdit,
            p_titulo: document.getElementById('blogTitulo').value.trim(),
            p_subtitulo: document.getElementById('blogSubtitulo').value.trim(),
            p_contenido_html: contenidoHtml,
            p_tipo_codigo: document.getElementById('blogTipo').value,
            p_categoria_nombre: document.getElementById('blogCategoria').value,
            p_autor_nombre: document.getElementById('blogAutor').value.trim(),
            p_url_imagen: imagen,
            p_fuente_nombre: document.getElementById('blogFuenteNombre').value.trim(),
            p_fuente_url: document.getElementById('blogFuenteUrl').value.trim(),
            p_destacado: document.getElementById('blogDestacado').checked,
            p_estado: document.getElementById('blogEstado').value
        });

        document.getElementById('btnCancelarBlog').click();
        await inicializarPanelConSupabase();
    });

    // 5. Testimonios
    document.getElementById('formTestimonio').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('testimonioIdEdit').value ? parseInt(document.getElementById('testimonioIdEdit').value) : null;

        await llamarProcedimiento('sp_guardar_testimonio', {
            p_testimonio_id: idEdit,
            p_cliente: document.getElementById('testCliente').value.trim(),
            p_cargo_cliente: document.getElementById('testCargo').value.trim(),
            p_comentario: document.getElementById('testComentario').value.trim(),
            p_destacado: document.getElementById('testDestacado').checked,
            p_estado: document.getElementById('testEstado').value
        });

        document.getElementById('btnCancelarTestimonio').click();
        await inicializarPanelConSupabase();
    });

    // 8. Vacantes
    document.getElementById('formNuevaVacante').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('vacIdEdit').value ? parseInt(document.getElementById('vacIdEdit').value) : null;
        const requisitos = document.getElementById('vacRequisitos').value.split('\n').map(r => r.trim()).filter(Boolean);

        await llamarProcedimiento('sp_guardar_vacante', {
            p_vacante_id: idEdit,
            p_puesto: document.getElementById('vacPuesto').value.trim(),
            p_area_nombre: document.getElementById('vacArea').value.trim(),
            p_descripcion: document.getElementById('vacDescripcion').value.trim(),
            p_requisitos: requisitos,
            p_modalidad: document.getElementById('vacModalidad').value.trim(),
            p_fecha_limite: document.getElementById('vacFechaLimite').value,
            p_activa: true
        });

        document.getElementById('btnCancelarVacante').click();
        await inicializarPanelConSupabase();
    });

    // 9. Configuración General y Nosotros
    document.getElementById('formConfigGeneral').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevaConfig = {
            nombre_estudio: document.getElementById('cfgNombreEstudio') ? document.getElementById('cfgNombreEstudio').value.trim() : 'Estudio Jurídico Ureta & Asociados',
            frase_institucional: document.getElementById('cfgFrase') ? document.getElementById('cfgFrase').value.trim() : 'Lealtad, trascendencia y excelencia',
            telefono_principal: document.getElementById('cfgTelefono').value.trim(),
            whatsapp_numero: document.getElementById('cfgWhatsapp') ? document.getElementById('cfgWhatsapp').value.trim() : '51980249579',
            correo_contacto: document.getElementById('cfgCorreo').value.trim(),
            direccion_fisica: document.getElementById('cfgDireccion').value.trim(),
            horario_atencion: document.getElementById('cfgHorario').value.trim(),
            historia_institucional: document.getElementById('cfgHistoria') ? document.getElementById('cfgHistoria').value.trim() : null,
            mision: document.getElementById('cfgMision') ? document.getElementById('cfgMision').value.trim() : null,
            vision: document.getElementById('cfgVision') ? document.getElementById('cfgVision').value.trim() : null
        };

        await llamarProcedimiento('sp_actualizar_configuracion_sitio', {
            p_nombre_estudio: nuevaConfig.nombre_estudio,
            p_frase: nuevaConfig.frase_institucional,
            p_telefono: nuevaConfig.telefono_principal,
            p_whatsapp: nuevaConfig.whatsapp_numero,
            p_correo: nuevaConfig.correo_contacto,
            p_direccion: nuevaConfig.direccion_fisica,
            p_horario: nuevaConfig.horario_atencion,
            p_historia: nuevaConfig.historia_institucional,
            p_mision: nuevaConfig.mision,
            p_vision: nuevaConfig.vision
        });

        localStorage.setItem('ureta_config_cache', JSON.stringify(nuevaConfig));
        document.getElementById('msgConfigGuardada').style.display = 'block';
    });

    // 10. Usuarios Administradores
    document.getElementById('formUsuarioAdmin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const idEdit = document.getElementById('userIdEdit').value ? parseInt(document.getElementById('userIdEdit').value) : null;
        const pass = document.getElementById('userPassword').value.trim();

        if (!idEdit && !pass) {
            alert('Debe ingresar una contraseña para el nuevo usuario administrador.');
            return;
        }

        await llamarProcedimiento('sp_guardar_usuario_admin', {
            p_usuario_id: idEdit,
            p_nombre: document.getElementById('userNombre').value.trim(),
            p_email: document.getElementById('userEmail').value.trim(),
            p_password: pass || null,
            p_rol_id: parseInt(document.getElementById('userRolId').value) || 1
        });

        document.getElementById('btnCancelarUsuario').click();
        await inicializarPanelConSupabase();
    });

    // =========================================================
    // 6. ACCIONES INDIVIDUALES DE ESTADO Y ELIMINACIÓN EN SUPABASE
    // =========================================================

    window.alternarEstadoPortada = async function(id, nuevoEstado) {
        await llamarProcedimiento('sp_estado_portada', { p_portada_id: id, p_publicado: nuevoEstado });
        await inicializarPanelConSupabase();
    };
    window.borrarPortada = async function(id) {
        await llamarProcedimiento('sp_eliminar_portada', { p_portada_id: id });
        await inicializarPanelConSupabase();
    };

    window.alternarEstadoArea = async function(idx) {
        const areas = obtenerAreasLegales();
        const nuevoEstado = !areas[idx].activo;
        if (areas[idx].id) {
            await llamarProcedimiento('sp_estado_area_legal', { p_area_id: areas[idx].id, p_activo: nuevoEstado });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarArea = async function(idx) {
        const areas = obtenerAreasLegales();
        if (areas[idx].id) {
            await llamarProcedimiento('sp_eliminar_area_legal', { p_area_id: areas[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.alternarEstadoStaff = async function(idx) {
        const staff = obtenerStaff();
        const nuevoEstado = !staff[idx].activo;
        if (staff[idx].id) {
            await llamarProcedimiento('sp_estado_abogado', { p_abogado_id: staff[idx].id, p_activo: nuevoEstado });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarStaff = async function(idx) {
        const staff = obtenerStaff();
        if (staff[idx].id) {
            await llamarProcedimiento('sp_eliminar_abogado', { p_abogado_id: staff[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.alternarEstadoBlog = async function(idx) {
        const blog = obtenerBlog();
        const nuevoEstado = blog[idx].estado === 'Publicado' ? 'Archivado' : 'Publicado';
        if (blog[idx].id) {
            await llamarProcedimiento('sp_estado_publicacion_blog', { p_publicacion_id: blog[idx].id, p_estado: nuevoEstado });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarBlog = async function(idx) {
        const blog = obtenerBlog();
        if (blog[idx].id) {
            await llamarProcedimiento('sp_eliminar_publicacion_blog', { p_publicacion_id: blog[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.cambiarEstadoTestimonio = async function(id, nuevoEstado, destacado) {
        await llamarProcedimiento('sp_estado_testimonio', { p_testimonio_id: id, p_estado: nuevoEstado, p_destacado: destacado });
        await inicializarPanelConSupabase();
    };
    window.borrarTestimonio = async function(id) {
        await llamarProcedimiento('sp_eliminar_testimonio', { p_testimonio_id: id });
        await inicializarPanelConSupabase();
    };
    window.moderarComentarioBlog = async function(id, nuevoEstado) {
        await llamarProcedimiento('sp_estado_comentario_blog', { p_comentario_id: id, p_estado: nuevoEstado });
        await inicializarPanelConSupabase();
    };
    window.borrarComentarioBlog = async function(id) {
        await llamarProcedimiento('sp_eliminar_comentario_blog', { p_comentario_id: id });
        await inicializarPanelConSupabase();
    };

    window.guardarGestionContacto = async function(idx) {
        const contactos = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
        const nuevoEstado = document.getElementById(`estContacto_${idx}`).value;
        const obs = document.getElementById(`obsContacto_${idx}`).value.trim();

        if (contactos[idx] && contactos[idx].id) {
            await llamarProcedimiento('sp_gestionar_solicitud_contacto', {
                p_solicitud_id: contactos[idx].id,
                p_estado: nuevoEstado,
                p_observaciones: obs
            });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarContacto = async function(idx) {
        const contactos = JSON.parse(localStorage.getItem('ureta_contactos_db') || '[]');
        if (contactos[idx] && contactos[idx].id) {
            await llamarProcedimiento('sp_eliminar_solicitud_contacto', { p_solicitud_id: contactos[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.cambiarEstadoPostulacion = async function(idx, nuevoEstado) {
        const postulaciones = JSON.parse(localStorage.getItem('ureta_postulaciones_db') || '[]');
        if (postulaciones[idx] && postulaciones[idx].id) {
            await llamarProcedimiento('sp_actualizar_estado_postulacion', {
                p_postulacion_id: postulaciones[idx].id,
                p_nuevo_estado: nuevoEstado
            });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarPostulacion = async function(idx) {
        const postulaciones = JSON.parse(localStorage.getItem('ureta_postulaciones_db') || '[]');
        if (postulaciones[idx] && postulaciones[idx].id) {
            await llamarProcedimiento('sp_eliminar_postulacion', { p_postulacion_id: postulaciones[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.alternarVacante = async function(idx) {
        const vacantes = obtenerVacantes();
        const nuevoEstado = !vacantes[idx].activa;
        if (vacantes[idx].id) {
            await llamarProcedimiento('sp_estado_vacante', { p_vacante_id: vacantes[idx].id, p_activa: nuevoEstado });
        }
        await inicializarPanelConSupabase();
    };
    window.eliminarVacante = async function(idx) {
        const vacantes = obtenerVacantes();
        if (vacantes[idx].id) {
            await llamarProcedimiento('sp_eliminar_vacante', { p_vacante_id: vacantes[idx].id });
        }
        await inicializarPanelConSupabase();
    };

    window.cambiarEstadoUsuario = async function(id, nuevoEstado) {
        await llamarProcedimiento('sp_estado_usuario_admin', { p_usuario_id: id, p_activo: nuevoEstado });
        await inicializarPanelConSupabase();
    };
    window.borrarUsuarioAdmin = async function(id) {
        await llamarProcedimiento('sp_eliminar_usuario_admin', { p_usuario_id: id });
        await inicializarPanelConSupabase();
    };

    document.getElementById('btnResetDatabase').addEventListener('click', async () => {
        localStorage.removeItem('ureta_areas_db');
        localStorage.removeItem('ureta_staff_db');
        localStorage.removeItem('ureta_blog_db');
        localStorage.removeItem('ureta_vacantes_db');
        await inicializarPanelConSupabase();
        alert('Todos los módulos han sido sincronizados desde Supabase.');
    });

    // =========================================================================
    // 11. SUBIDA AUTOMÁTICA DE FOTOS DESDE LA PC EN TODOS LOS FORMULARIOS
    // =========================================================================
    document.querySelectorAll('.input-subir-foto-pc').forEach(inputFile => {
        inputFile.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            const targetId = inputFile.dataset.target;
            const carpeta = inputFile.dataset.carpeta || 'general';
            const inputUrl = document.getElementById(targetId);
            const estadoEl = inputFile.closest('.upload-img-inline')?.querySelector('.estado-subida-foto');

            if (estadoEl) estadoEl.textContent = 'Subiendo imagen a la nube...';

            const urlPublica = await subirImagenWebSupabase(archivo, carpeta);
            if (urlPublica && inputUrl) {
                inputUrl.value = urlPublica;
                if (estadoEl) estadoEl.textContent = '✓ Imagen subida lista para guardar';
            } else if (estadoEl) {
                estadoEl.textContent = '✗ Error al subir imagen';
            }
            inputFile.value = '';
        });
    });

    // =========================================================================
    // 12. CRUD DE EVENTOS ACADÉMICOS (CON ENLACE EDITABLE DE GOOGLE FORMS)
    // =========================================================================
    const tablaEventos = document.getElementById('tablaAdminEventos');
    const formEvento = document.getElementById('formAdminEvento');
    let cacheEventosAdmin = [];

    async function cargarEventosAdmin() {
        if (!tablaEventos) return;
        cacheEventosAdmin = await supabaseRest('eventos_academicos', 'GET', '?select=*&order=evento_id.desc') || [];
        tablaEventos.innerHTML = cacheEventosAdmin.map(ev => `
            <tr>
                <td>
                    <strong>${ev.titulo}</strong><br>
                    <small style="color:#64748b;">${ev.categoria} • ${ev.ponente}</small>
                </td>
                <td>${ev.fecha_evento || '-'}<br><small>${ev.modalidad}</small></td>
                <td>
                    ${ev.link_inscripcion ? `<a href="${ev.link_inscripcion}" target="_blank" style="color:#238d41; font-weight:600;">Abrir Forms ↗</a>` : 'Sin enlace'}
                </td>
                <td><span class="badge-status ${ev.estado === 'Publicado' ? 'badge-active' : 'badge-hidden'}">${ev.estado}</span></td>
                <td>
                    <button class="btn-sm-action" onclick="editarEventoAdmin(${ev.evento_id})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="eliminarEventoAdmin(${ev.evento_id})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">No hay eventos registrados.</td></tr>';
    }

    window.editarEventoAdmin = (id) => {
        const ev = cacheEventosAdmin.find(x => x.evento_id === id);
        if (!ev) return;
        document.getElementById('evId').value = ev.evento_id;
        document.getElementById('evTitulo').value = ev.titulo || '';
        document.getElementById('evCategoria').value = ev.categoria || '';
        document.getElementById('evFecha').value = ev.fecha_evento || '';
        document.getElementById('evModalidad').value = ev.modalidad || 'Presencial / Virtual';
        document.getElementById('evHoraLugar').value = ev.hora_lugar || '';
        document.getElementById('evPonente').value = ev.ponente || '';
        document.getElementById('evLinkForms').value = ev.link_inscripcion || '';
        document.getElementById('evImagen').value = ev.imagen_url || '';
        document.getElementById('evSubtitulo').value = ev.subtitulo || '';
        document.getElementById('evDescripcion').value = (ev.descripcion_html || '').replace(/<[^>]+>/g, '');
        document.getElementById('evDestacado').checked = !!ev.destacado;
        document.getElementById('evEstado').value = ev.estado || 'Publicado';
        document.getElementById('tituloFormEvento').textContent = 'Editando Evento #' + ev.evento_id;
        formEvento.scrollIntoView({ behavior: 'smooth' });
    };

    window.eliminarEventoAdmin = async (id) => {
        if (!confirm('¿Eliminar este evento académico permanentemente?')) return;
        await supabaseRest('eventos_academicos', 'DELETE', `?evento_id=eq.${id}`);
        cargarEventosAdmin();
    };

    if (formEvento) {
        formEvento.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('evId').value;
            const descTexto = document.getElementById('evDescripcion').value.trim();
            const payload = {
                titulo: document.getElementById('evTitulo').value.trim(),
                categoria: document.getElementById('evCategoria').value.trim(),
                fecha_evento: document.getElementById('evFecha').value,
                modalidad: document.getElementById('evModalidad').value,
                hora_lugar: document.getElementById('evHoraLugar').value.trim(),
                ponente: document.getElementById('evPonente').value.trim(),
                link_inscripcion: document.getElementById('evLinkForms').value.trim(),
                imagen_url: document.getElementById('evImagen').value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
                subtitulo: document.getElementById('evSubtitulo').value.trim(),
                descripcion_html: `<p>${descTexto.replace(/\n/g, '</p><p>')}</p>`,
                destacado: document.getElementById('evDestacado').checked,
                estado: document.getElementById('evEstado').value
            };

            if (id) {
                await supabaseRest('eventos_academicos', 'PATCH', `?evento_id=eq.${id}`, payload);
            } else {
                await supabaseRest('eventos_academicos', 'POST', '', payload);
            }
            formEvento.reset();
            document.getElementById('evId').value = '';
            document.getElementById('tituloFormEvento').textContent = 'Crear / Editar Evento Académico';
            cargarEventosAdmin();
            alert('Evento guardado correctamente en Supabase.');
        });

        document.getElementById('btnCancelarEvento')?.addEventListener('click', () => {
            formEvento.reset();
            document.getElementById('evId').value = '';
            document.getElementById('tituloFormEvento').textContent = 'Crear / Editar Evento Académico';
        });

        cargarEventosAdmin();
    }

    // =========================================================================
    // 13. CRUD DE HISTORIAS "DE PRACTICANTE A ABOGADO"
    // =========================================================================
    const tablaHistorias = document.getElementById('tablaAdminHistorias');
    const formHistoria = document.getElementById('formAdminHistoria');
    let cacheHistoriasAdmin = [];

    async function cargarHistoriasAdmin() {
        if (!tablaHistorias) return;
        cacheHistoriasAdmin = await supabaseRest('historias_carrera', 'GET', '?select=*&order=orden.asc,historia_id.asc') || [];
        tablaHistorias.innerHTML = cacheHistoriasAdmin.map(h => `
            <tr>
                <td><img src="${h.foto_url}" alt="${h.nombre_completo}" style="width:46px; height:46px; border-radius:50%; object-fit:cover;"></td>
                <td><strong>${h.nombre_completo}</strong><br><small style="color:#238d41;">${h.cargo_actual}</small></td>
                <td>${h.etapa_inicio}</td>
                <td>${h.orden}</td>
                <td>
                    <button class="btn-sm-action" onclick="editarHistoriaAdmin(${h.historia_id})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-sm-action" onclick="eliminarHistoriaAdmin(${h.historia_id})" style="color:#dc2626;">Eliminar</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">No hay historias registradas.</td></tr>';
    }

    window.editarHistoriaAdmin = (id) => {
        const h = cacheHistoriasAdmin.find(x => x.historia_id === id);
        if (!h) return;
        document.getElementById('histId').value = h.historia_id;
        document.getElementById('histNombre').value = h.nombre_completo || '';
        document.getElementById('histCargo').value = h.cargo_actual || '';
        document.getElementById('histInicio').value = h.etapa_inicio || '';
        document.getElementById('histOrden').value = h.orden || 1;
        document.getElementById('histFoto').value = h.foto_url || '';
        document.getElementById('histRelato').value = h.historia || '';
        document.getElementById('tituloFormHistoria').textContent = 'Editando Historia de ' + h.nombre_completo;
        formHistoria.scrollIntoView({ behavior: 'smooth' });
    };

    window.eliminarHistoriaAdmin = async (id) => {
        if (!confirm('¿Eliminar esta historia de carrera?')) return;
        await supabaseRest('historias_carrera', 'DELETE', `?historia_id=eq.${id}`);
        cargarHistoriasAdmin();
    };

    if (formHistoria) {
        formHistoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('histId').value;
            const payload = {
                nombre_completo: document.getElementById('histNombre').value.trim(),
                cargo_actual: document.getElementById('histCargo').value.trim(),
                etapa_inicio: document.getElementById('histInicio').value.trim(),
                orden: parseInt(document.getElementById('histOrden').value, 10) || 1,
                foto_url: document.getElementById('histFoto').value.trim(),
                historia: document.getElementById('histRelato').value.trim(),
                activo: true
            };

            if (id) {
                await supabaseRest('historias_carrera', 'PATCH', `?historia_id=eq.${id}`, payload);
            } else {
                await supabaseRest('historias_carrera', 'POST', '', payload);
            }
            formHistoria.reset();
            document.getElementById('histId').value = '';
            document.getElementById('tituloFormHistoria').textContent = 'Agregar / Editar Historia de Carrera';
            cargarHistoriasAdmin();
            alert('Historia guardada correctamente.');
        });

        document.getElementById('btnCancelarHistoria')?.addEventListener('click', () => {
            formHistoria.reset();
            document.getElementById('histId').value = '';
            document.getElementById('tituloFormHistoria').textContent = 'Agregar / Editar Historia de Carrera';
        });

        cargarHistoriasAdmin();
    }
});