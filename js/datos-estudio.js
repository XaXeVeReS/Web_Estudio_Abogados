// =========================================================================
// 1. CONECTOR OFICIAL A SUPABASE (VISTAS, PROCEDIMIENTOS Y STORAGE)
// =========================================================================
const SUPABASE_URL = 'https://fzbvyrwraihpetrzpdgq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_35QlL8aPA-TZ_PBKV15fpw_lt-fQiAm';

function supabaseEstaConfigurado() {
    return typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('https://') && SUPABASE_KEY.length > 15;
}

async function consultarVistaSupabase(vistaOTabla, filtro = '?select=*') {
    if (!supabaseEstaConfigurado()) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${vistaOTabla}${filtro}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        return res.ok ? await res.json() : null;
    } catch {
        return null;
    }
}

async function llamarProcedimiento(nombreSp, parametros = {}) {
    if (!supabaseEstaConfigurado()) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nombreSp}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(parametros)
        });
        if (!res.ok) return null;
        const txt = await res.text();
        return txt ? JSON.parse(txt) : true;
    } catch {
        return null;
    }
}

async function supabaseRest(tabla, metodo = 'GET', query = '', body = null) {
    if (!supabaseEstaConfigurado()) return null;
    const opciones = {
        method: metodo,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    if (body) opciones.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}${query}`, opciones);
    if (!res.ok) return null;
    return metodo === 'DELETE' ? true : await res.json();
}

// Subida unificada para PDFs (cvs_postulantes) e Imágenes (imagenes_web)
async function subirArchivoStorageSupabase(bucket, archivo, subcarpeta = '') {
    if (!supabaseEstaConfigurado() || !archivo) return null;
    try {
        const ext = archivo.name.split('.').pop().toLowerCase() || 'bin';
        const base = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const prefijo = subcarpeta ? `${subcarpeta}/` : '';
        const ruta = `${prefijo}${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${base}`;

        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${ruta}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': archivo.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg'),
                'x-upsert': 'true'
            },
            body: archivo
        });
        return res.ok ? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${ruta}` : null;
    } catch {
        return null;
    }
}

async function subirImagenWebSupabase(archivo, carpeta = 'general') {
    return await subirArchivoStorageSupabase('imagenes_web', archivo, carpeta);
}

async function subirCvPdfASupabase(archivo, datosPostulante) {
    const urlPdfPublica = await subirArchivoStorageSupabase('cvs_postulantes', archivo);
    return await llamarProcedimiento('sp_registrar_postulacion_con_cv', {
        p_puesto: datosPostulante.puesto,
        p_nombres: datosPostulante.nombres,
        p_documento: datosPostulante.documento,
        p_correo: datosPostulante.correo,
        p_telefono: datosPostulante.telefono,
        p_profesion: datosPostulante.profesion,
        p_experiencia: datosPostulante.experiencia,
        p_mensaje: datosPostulante.mensaje || '',
        p_nombre_archivo_cv: archivo.name,
        p_url_archivo_cv: urlPdfPublica || archivo.name,
        p_tamano_kb: Math.round(archivo.size / 1024) + ' KB'
    });
}

// =========================================================================
// 2. RESPALDO LOCAL DE LAS 9 ÁREAS LEGALES OFICIALES
// =========================================================================
const AREAS_LEGALES_INICIAL = [
    { id: 1, slug: 'derecho-civil', nombre: 'Derecho Civil', icono: 'fa-solid fa-scale-balanced', imagen: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', resumen: 'Obligaciones, contratos civiles, responsabilidad civil y patrocinio procesal en litigios complejos.', descripcion: 'Asesoría preventiva y patrocinio judicial integral en materia civil.', servicios: ['Contratos civiles', 'Indemnización por daños', 'Desalojos y obligaciones'], situaciones: ['Incumplimiento contractual', 'Defensa posesoria'], activo: true },
    { id: 2, slug: 'derecho-laboral', nombre: 'Derecho Laboral', icono: 'fa-solid fa-briefcase', imagen: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80', resumen: 'Prevención de contingencias laborales, contratación, auditorías e inspecciones ante SUNAFIL.', descripcion: 'Asesoría estratégica en relaciones individuales y colectivas de trabajo.', servicios: ['Contratación laboral', 'Defensa ante SUNAFIL', 'Procesos laborales'], situaciones: ['Fiscalización laboral', 'Auditoría de planillas'], activo: true },
    { id: 3, slug: 'derecho-familia', nombre: 'Derecho de Familia', icono: 'fa-solid fa-people-roof', imagen: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', resumen: 'Patrocinio reservado y especializado en divorcios, tenencia, alimentos y sucesiones.', descripcion: 'Acompañamiento técnico y confidencial en conflictos familiares y sucesorios.', servicios: ['Divorcios', 'Alimentos y tenencia', 'Sucesiones intestadas'], situaciones: ['Acuerdos familiares', 'Partición de herencia'], activo: true },
    { id: 4, slug: 'derecho-penal-delitos-especiales', nombre: 'Derecho Penal - Delitos Especiales', icono: 'fa-solid fa-gavel', imagen: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', resumen: 'Defensa técnica especializada en delitos económicos, corrupción de funcionarios, tributarios y ambientales.', descripcion: 'Patrocinio penal de alta complejidad en el ámbito empresarial y función pública.', servicios: ['Delitos contra la administración pública', 'Delitos económicos y tributarios', 'Compliance penal'], situaciones: ['Investigaciones preparatorias complejas', 'Medidas coercitivas'], activo: true },
    { id: 5, slug: 'derecho-penal-delitos-comunes', nombre: 'Derecho Penal - Delitos Comunes', icono: 'fa-solid fa-shield-halved', imagen: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80', resumen: 'Defensa penal integral y representación de agraviados en delitos contra el patrimonio y la persona.', descripcion: 'Defensa técnica desde diligencias preliminares hasta juicio oral.', servicios: ['Delitos contra el patrimonio', 'Delitos contra la vida y salud', 'Actor civil'], situaciones: ['Citaciones policiales o fiscales', 'Juicio oral'], activo: true },
    { id: 6, slug: 'saneamientos', nombre: 'Saneamientos', icono: 'fa-solid fa-house-chimney', imagen: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80', resumen: 'Regularización físico-legal de inmuebles, prescripción adquisitiva, independizaciones y trámites SUNARP.', descripcion: 'Seguridad jurídica y titularidad registral de predios urbanos y rurales.', servicios: ['Prescripción adquisitiva', 'Independizaciones y declaratoria de fábrica', 'Levantamiento de observaciones SUNARP'], situaciones: ['Predios sin inscripción completa', 'Superposición de partidas'], activo: true },
    { id: 7, slug: 'arbitraje', nombre: 'Arbitraje', icono: 'fa-solid fa-handshake', imagen: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80', resumen: 'Resolución alternativa de controversias comerciales, civiles y en contrataciones con el Estado.', descripcion: 'Representación técnica en procesos arbitrales institucionales y ad hoc.', servicios: ['Arbitraje en Contrataciones con el Estado', 'Arbitraje comercial y de construcción', 'Ejecución de laudos'], situaciones: ['Controversias de obra', 'Incumplimiento contractual'], activo: true },
    { id: 8, slug: 'derecho-empresarial', nombre: 'Derecho Empresarial', icono: 'fa-solid fa-building-columns', imagen: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', resumen: 'Asesoría corporativa integral, constitución de sociedades, contratos mercantiles y reestructuración.', descripcion: 'Estructuras societarias sólidas y contratos blindados para empresas.', servicios: ['Constitución y reorganización societaria', 'Gobierno corporativo', 'Contratos mercantiles'], situaciones: ['Expansión comercial', 'Ingreso de socios'], activo: true },
    { id: 9, slug: 'derecho-administrativo', nombre: 'Derecho Administrativo', icono: 'fa-solid fa-landmark', imagen: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80', resumen: 'Procedimientos administrativos sancionadores, licencias, regulación sectorial y contencioso-administrativo.', descripcion: 'Defensa eficaz frente a municipalidades, ministerios y entidades públicas.', servicios: ['Procedimientos sancionadores (PAS)', 'Recursos administrativos', 'Procesos contencioso-administrativos'], situaciones: ['Multas y clausuras', 'Denegatoria de licencias'], activo: true }
];

function obtenerAreasLegales() {
    const g = localStorage.getItem('ureta_areas_db');
    return g ? JSON.parse(g) : AREAS_LEGALES_INICIAL;
}
function obtenerStaff() {
    return JSON.parse(localStorage.getItem('ureta_staff_db') || '[]');
}
function obtenerBlog() {
    return JSON.parse(localStorage.getItem('ureta_blog_db') || '[]');
}
function obtenerVacantes() {
    return JSON.parse(localStorage.getItem('ureta_vacantes_db') || '[]');
}

// =========================================================================
// 3. SINCRONIZACIÓN PARALELA EN SEGUNDO PLANO CON SUPABASE
// =========================================================================
let promesaSincronizacion = null;

async function sincronizarVistasSupabase() {
    if (!supabaseEstaConfigurado()) return;
    if (promesaSincronizacion) return promesaSincronizacion;

    promesaSincronizacion = (async () => {
        try {
            const [areasDB, staffDB, blogDB, vacDB, portadasDB, testDB, configArr, contactosDB, postDB] = await Promise.all([
                consultarVistaSupabase('vw_areas_legales_activas'),
                consultarVistaSupabase('vw_abogados_completos'),
                consultarVistaSupabase('vw_blog_publicaciones'),
                consultarVistaSupabase('vw_vacantes_con_postulantes'),
                consultarVistaSupabase('vw_portadas_activas', '?select=*&publicado=eq.true&order=orden.asc'),
                consultarVistaSupabase('vw_testimonios_completos', '?select=*&estado=eq.Aprobado'),
                consultarVistaSupabase('configuracion_sitio', '?select=*&limit=1'),
                consultarVistaSupabase('solicitudes_contacto', '?select=*&order=solicitud_id.desc'),
                consultarVistaSupabase('postulaciones', '?select=*&order=postulacion_id.desc')
            ]);

            if (areasDB && areasDB.length > 0) {
                localStorage.setItem('ureta_areas_db', JSON.stringify(areasDB.map(a => ({
                    id: a.area_id, slug: a.slug, nombre: a.nombre, icono: a.icono_clase, imagen: a.imagen_url,
                    resumen: a.resumen_tarjeta, descripcion: a.descripcion_servicio,
                    servicios: Array.isArray(a.servicios_ofrecidos) ? a.servicios_ofrecidos : [],
                    situaciones: Array.isArray(a.situaciones_asesoria) ? a.situaciones_asesoria : [],
                    activo: a.activo
                }))));
            }
            if (staffDB && staffDB.length > 0) {
                localStorage.setItem('ureta_staff_db', JSON.stringify(staffDB.map(s => ({
                    id: s.abogado_id, nombre: s.nombre_completo, cargo: s.cargo,
                    colegiatura: s.numero_colegiatura || 'Registro Oficial', foto: s.foto_url,
                    especialidades: Array.isArray(s.especialidades) ? s.especialidades : [],
                    formacion: s.formacion_academica || '', cursos: s.cursos_especializaciones || 'Especialización continua',
                    biografia: s.biografia || '', correo: s.correo_profesional || 'contacto@estudio-ureta.com', activo: s.activo
                }))));
            }
            if (blogDB && blogDB.length > 0) {
                localStorage.setItem('ureta_blog_db', JSON.stringify(blogDB.map(b => ({
                    id: b.publicacion_id, titulo: b.titulo, subtitulo: b.subtitulo, categoria: b.categoria_nombre,
                    tipo: b.tipo_codigo, autor: b.autor, fecha: b.fecha_publicacion, destacado: b.destacado,
                    estado: b.estado, imagen: b.imagen_url, contenido: b.contenido_html,
                    fuenteNombre: b.fuente_nombre || '', fuenteUrl: b.fuente_url_original || ''
                }))));
            }
            if (vacDB && vacDB.length > 0) {
                localStorage.setItem('ureta_vacantes_db', JSON.stringify(vacDB.map(v => ({
                    id: v.vacante_id, puesto: v.nombre_puesto, area: v.area_nombre, descripcion: v.descripcion,
                    requisitos: Array.isArray(v.requisitos) ? v.requisitos : [], modalidad: v.modalidad,
                    fechaPublicacion: v.fecha_publicacion, fechaLimite: v.fecha_limite, activa: v.activa
                }))));
            }
            if (Array.isArray(contactosDB)) {
                localStorage.setItem('ureta_contactos_db', JSON.stringify(contactosDB.map(c => ({
                    id: c.solicitud_id, nombres: c.nombres_apellidos, correo: c.correo_electronico,
                    telefono: c.telefono, empresa: c.empresa || '', area: c.nombre_area_texto || 'Consulta General',
                    asunto: c.asunto, descripcion: c.descripcion_consulta, estado: c.estado_gestion || 'Nueva',
                    observaciones: c.observaciones_internas || '',
                    fecha: c.fecha_registro ? new Date(c.fecha_registro).toLocaleString('es-PE') : ''
                }))));
            }
            if (Array.isArray(postDB)) {
                localStorage.setItem('ureta_postulaciones_db', JSON.stringify(postDB.map(p => ({
                    id: p.postulacion_id, nombres: p.nombres_apellidos, documento: p.documento_identidad,
                    correo: p.correo, telefono: p.telefono, profesion: p.profesion, puesto: p.puesto_postula,
                    experiencia: p.resumen_experiencia, mensaje: p.mensaje_presentacion || '',
                    nombreArchivoCv: p.nombre_archivo_cv, url_archivo_cv: p.url_archivo_cv,
                    tamanoKb: p.tamano_kb, estado: p.estado_postulacion || 'Recibida',
                    fecha: p.fecha_postulacion ? new Date(p.fecha_postulacion).toLocaleString('es-PE') : ''
                }))));
            }
            if (portadasDB) localStorage.setItem('ureta_portadas_cache', JSON.stringify(portadasDB));
            if (testDB) localStorage.setItem('ureta_testimonios_cache', JSON.stringify(testDB));
            if (configArr && configArr[0]) localStorage.setItem('ureta_config_cache', JSON.stringify(configArr[0]));

            if (typeof window.actualizarLayoutMaestro === 'function') {
                window.actualizarLayoutMaestro();
            }
        } catch (err) {
            console.warn('Aviso de sincronización:', err);
        } finally {
            promesaSincronizacion = null;
        }
    })();

    return promesaSincronizacion;
}