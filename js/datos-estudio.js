// =========================================================================
// 1. CONFIGURACIÓN Y CONECTOR OFICIAL A SUPABASE (VISTAS, PROCEDIMIENTOS Y PDF)
// =========================================================================
const SUPABASE_URL = 'https://fzbvyrwraihpetrzpdgq.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_35QlL8aPA-TZ_PBKV15fpw_lt-fQiAm';

function supabaseEstaConfigurado() {
    return (
        typeof SUPABASE_URL === 'string' &&
        SUPABASE_URL.startsWith('https://') &&
        typeof SUPABASE_KEY === 'string' &&
        SUPABASE_KEY.length > 15
    );
}

// A. Consultar cualquier Vista (vw_...) o Tabla de Supabase
async function consultarVistaSupabase(nombreVistaOTabla, filtro = '?select=*') {
    if (!supabaseEstaConfigurado()) return null;
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${nombreVistaOTabla}${filtro}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        return res.ok ? await res.json() : null;
    } catch (err) {
        console.warn(`Aviso al consultar ${nombreVistaOTabla} en Supabase:`, err);
        return null;
    }
}

// B. Llamar a cualquiera de tus Procedimientos Almacenados individuales (sp_...)
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
        const texto = await res.text();
        return texto ? JSON.parse(texto) : true;
    } catch (err) {
        console.warn(`Aviso en procedimiento ${nombreSp}:`, err);
        return null;
    }
}

// C. Subir un archivo (PDF de CV o Imagen) a un Bucket de Supabase Storage
async function subirArchivoStorageSupabase(bucket, archivo) {
    if (!supabaseEstaConfigurado() || !archivo) return null;
    try {
        const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const nombreUnico = `${Date.now()}_${nombreLimpio}`;
        const urlSubida = `${SUPABASE_URL}/storage/v1/object/${bucket}/${nombreUnico}`;

        const res = await fetch(urlSubida, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': archivo.type || 'application/octet-stream'
            },
            body: archivo
        });

        if (res.ok) {
            return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${nombreUnico}`;
        }
        return null;
    } catch (err) {
        console.warn('Error subiendo archivo a Supabase Storage:', err);
        return null;
    }
}

// D. Subir el CV en PDF al Bucket 'cvs_postulantes' y ejecutar sp_registrar_postulacion_con_cv
async function subirCvPdfASupabase(archivo, datosPostulante) {
    if (!supabaseEstaConfigurado()) return null;

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
// 2. BASE DE DATOS DE RESPALDO: LAS 13 ÁREAS LEGALES
// =========================================================================
const AREAS_INICIALES = [
    {
        id: 1,
        slug: "derecho-corporativo",
        nombre: "Derecho Corporativo",
        icono: "fa-solid fa-building-columns",
        imagen: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
        resumen: "Asesoría societaria integral, gobierno corporativo, contratos mercantiles y operaciones empresariales.",
        descripcion: "Brindamos asesoría legal integral a empresas en todas las etapas de su desarrollo societario y comercial, asegurando el cumplimiento normativo, la mitigación de contingencias y la solidez contractual en cada operación.",
        servicios: [
            "Constitución de sociedades, sucursales y consorcios empresariales",
            "Reorganización societaria: fusiones, escisiones y transformaciones",
            "Gobierno corporativo, juntas generales de accionistas y sesiones de directorio",
            "Negociación, redacción y revisión de contratos mercantiles y civiles",
            "Otorgamiento y revocatoria de poderes e inscripción ante SUNARP"
        ],
        situaciones: [
            "Cuando deseas constituir una empresa o estructurar acuerdos entre socios",
            "Ante la negociación de contratos estratégicos con proveedores, clientes o inversionistas",
            "Para prevenir conflictos societarios o formalizar acuerdos de directorio y junta general"
        ],
        activo: true
    },
    {
        id: 2,
        slug: "derecho-laboral",
        nombre: "Derecho Laboral",
        icono: "fa-solid fa-briefcase",
        imagen: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
        resumen: "Prevención de contingencias laborales, contratación, auditorías e inspecciones ante SUNAFIL.",
        descripcion: "Diseñamos estrategias laborales preventivas para empleadores y ejercemos el patrocinio técnico en procedimientos administrativos inspectivos y procesos judiciales laborales.",
        servicios: [
            "Elaboración de contratos de trabajo sujetos a modalidad y régimen general",
            "Redacción e implementación de Reglamentos Internos de Trabajo (RIT) y políticas de hostigamiento",
            "Asesoría y defensa en fiscalizaciones y procedimientos sancionadores ante SUNAFIL",
            "Procedimientos disciplinarios y desvinculación laboral conforme a ley",
            "Patrocinio en procesos judiciales bajo la Nueva Ley Procesal del Trabajo"
        ],
        situaciones: [
            "Recepción de requerimientos o actas de infracción emitidas por SUNAFIL",
            "Adecuación de planillas, modalidades contractuales y políticas internas de personal",
            "Defensa frente a demandas por despido, desnaturalización de contratos o beneficios sociales"
        ],
        activo: true
    },
    {
        id: 3,
        slug: "recuperaciones",
        nombre: "Recuperaciones",
        icono: "fa-solid fa-hand-holding-dollar",
        imagen: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80",
        resumen: "Gestión estratégica de cobranza prejudicial, judicial y ejecución de garantías mobiliarias e inmobiliarias.",
        descripcion: "Optimizamos la recuperación de créditos, carteras morosas y acreencias comerciales mediante mecanismos de negociación extrajudicial, medidas cautelares y procesos de ejecución.",
        servicios: [
            "Cobranza preventiva y negociación extrajudicial con suscripción de transacciones",
            "Procesos únicos de ejecución de títulos valores (letras de cambio, pagarés, facturas negociables)",
            "Ejecución de garantías hipotecarias y garantías mobiliarias",
            "Solicitud y ejecución de medidas cautelares de embargo en forma de retención, inscripción o secuestro",
            "Recuperación de carteras crediticias corporativas y financieras"
        ],
        situaciones: [
            "Incumplimiento de pago de facturas, letras, pagarés o contratos de mutuo",
            "Necesidad de asegurar el cobro urgente mediante el embargo preventivo de bienes del deudor",
            "Ejecución judicial de hipotecas ante el vencimiento de obligaciones garantizadas"
        ],
        activo: true
    },
    {
        id: 4,
        slug: "saneamiento-propiedades",
        nombre: "Saneamiento de Propiedades",
        icono: "fa-solid fa-house-circle-check",
        imagen: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80",
        resumen: "Regularización registral, prescripción adquisitiva, independizaciones y defensa de la propiedad.",
        descripcion: "Brindamos seguridad jurídica al patrimonio inmobiliario urbano y rural, gestionando el saneamiento físico-legal de predios ante municipalidades, notarías, SUNARP y el Poder Judicial.",
        servicios: [
            "Prescripción adquisitiva de dominio en vía notarial y judicial",
            "Otorgamiento de escritura pública y formación de títulos supletorios",
            "Rectificación de áreas, linderos y medidas perimétricas",
            "Declaratoria de fábrica, independización, subdivisión y acumulación de lotes",
            "Estudio de títulos para compraventa segura de inmuebles"
        ],
        situaciones: [
            "Inmuebles que solo cuentan con minuta o contrato privado sin inscripción en SUNARP",
            "Discrepancias entre el área física real del terreno y la partida registral",
            "Regularización de edificaciones, subdivisión de terrenos familiares o defensa ante litigios sobre propiedad"
        ],
        activo: true
    },
    {
        id: 5,
        slug: "derecho-administrativo",
        nombre: "Derecho Administrativo",
        icono: "fa-solid fa-landmark",
        imagen: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80",
        resumen: "Procedimientos administrativos, licencias, recursos impugnativos y defensa ante entidades públicas.",
        descripcion: "Representamos a personas naturales y jurídicas en sus relaciones, trámites y procedimientos sancionadores frente a municipalidades, gobiernos regionales, ministerios y organismos reguladores.",
        servicios: [
            "Defensa en Procedimientos Administrativos Sancionadores (PAS) y medidas complementarias",
            "Interposición de recursos de reconsideración y apelación administrativa",
            "Gestión de licencias de funcionamiento, autorizaciones sectoriales y certificados ITSE",
            "Aplicación del silencio administrativo positivo y negativo",
            "Demandas Contencioso-Administrativas ante el Poder Judicial"
        ],
        situaciones: [
            "Imposición de multas administrativas, clausuras temporales o definitivas de locales",
            "Denegatoria injustificada de licencias, permisos o autorizaciones municipales",
            "Impugnación de resoluciones administrativas que vulneran derechos del administrado"
        ],
        activo: true
    },
    {
        id: 6,
        slug: "area-arbitral",
        nombre: "Área Arbitral",
        icono: "fa-solid fa-scale-balanced",
        imagen: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?auto=format&fit=crop&w=1000&q=80",
        resumen: "Representación en arbitrajes comerciales, de contratación pública y ejecución de laudos.",
        descripcion: "Patrocinamos controversias contractuales complejas ante centros de arbitraje institucionales y tribunales ad hoc, tanto en controversias entre privados como en Contrataciones con el Estado.",
        servicios: [
            "Patrocinio en arbitrajes de Contrataciones con el Estado (obras públicas, bienes y servicios)",
            "Arbitraje comercial, civil y societario entre empresas privadas",
            "Redacción de convenios arbitrales y diseño de estrategia probatoria arbitral",
            "Recursos de anulación de laudo arbitral ante el Poder Judicial",
            "Procesos de ejecución judicial de laudos arbitrales"
        ],
        situaciones: [
            "Controversias por ampliaciones de plazo, valorizaciones, penalidades o resolución de contratos con el Estado",
            "Disputas derivadas de contratos empresariales que contienen cláusula arbitral",
            "Necesidad de ejecutar forzadamente un laudo arbitral favorable"
        ],
        activo: true
    },
    {
        id: 7,
        slug: "derecho-civil",
        nombre: "Derecho Civil",
        icono: "fa-solid fa-gavel",
        imagen: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80",
        resumen: "Obligaciones, contratos civiles, responsabilidad civil y patrocinio procesal civil.",
        descripcion: "Protegemos los derechos patrimoniales y extrapatrimoniales de nuestros clientes mediante la prevención contractual y una defensa procesal rigurosa ante los juzgados y salas civiles.",
        servicios: [
            "Elaboración y negociación de contratos de compraventa, arrendamiento, mutuo, obra y locación",
            "Procesos sobre nulidad e ineficacia de acto jurídico",
            "Demandas de indemnización por daños y perjuicios (responsabilidad contractual y extracontractual)",
            "Procesos de desalojo, reivindicación, mejor derecho de propiedad e interdictos",
            "Obligación de dar suma de dinero y ejecución de garantías"
        ],
        situaciones: [
            "Incumplimiento de contratos civiles o necesidad de blindar legalmente una transacción patrimonial",
            "Ocupación precaria o vencimiento de contratos de arrendamiento de inmuebles",
            "Daños patrimoniales o morales ocasionados por incumplimientos o accidentes"
        ],
        activo: true
    },
    {
        id: 8,
        slug: "derecho-familia",
        nombre: "Derecho de Familia",
        icono: "fa-solid fa-people-roof",
        imagen: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80",
        resumen: "Sucesiones, régimen patrimonial del matrimonio, divorcios, tenencia y alimentos.",
        descripcion: "Brindamos asesoría especializada con trato humano, empático y estricta reserva en asuntos de derecho familiar, niñez y planificación sucesoria.",
        servicios: [
            "Divorcio por causal en vía judicial y separación convencional en vía notarial o municipal",
            "Procesos de alimentos, tenencia, régimen de visitas y patria potestad",
            "Sustitución o liquidación del régimen patrimonial de sociedad de gananciales",
            "Sucesión intestada (declaratoria de herederos), testamentos y petición de herencia",
            "División y partición de bienes hereditarios"
        ],
        situaciones: [
            "Acuerdos o litigios derivados de la separación conyugal y distribución de bienes",
            "Determinación de pensiones alimenticias, tenencia o permisos de viaje de menores",
            "Fallecimiento de un familiar sin testamento o necesidad de planificar la herencia en vida"
        ],
        activo: true
    },
    {
        id: 9,
        slug: "derecho-penal",
        nombre: "Derecho Penal",
        icono: "fa-solid fa-shield-halved",
        imagen: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80",
        resumen: "Defensa técnica especializada, prevención de delitos empresariales (Compliance) y litigación oral.",
        descripcion: "Ejercemos la defensa técnica penal y el patrocinio como parte agraviada o actor civil en todas las etapas del proceso penal común y especial, con énfasis en litigación oral estratégica.",
        servicios: [
            "Defensa en diligencias preliminares, investigación preparatoria, etapa intermedia y juicio oral",
            "Derecho penal económico, tributario, ambiental y delitos contra el patrimonio",
            "Delitos contra la administración pública y lavado de activos",
            "Audiencias de tutela de derechos, control de plazo y oposición a prisión preventiva",
            "Redacción de denuncias penales y constitución en actor civil para reparación civil"
        ],
        situaciones: [
            "Recepción de citaciones policiales o disposiciones fiscales de inicio de investigación",
            "Necesidad de defensa inmediata ante medidas coercitivas o detenciones preliminares",
            "Empresas o personas perjudicadas por estafas, apropiación ilícita o fraudes en la administración"
        ],
        activo: true
    },
    {
        id: 10,
        slug: "competencia-consumidor",
        nombre: "Competencia y Protección del Consumidor",
        icono: "fa-solid fa-user-shield",
        imagen: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80",
        resumen: "Defensa ante INDECOPI, prevención de infracciones al consumidor, publicidad y competencia desleal.",
        descripcion: "Asesoramos a proveedores y consumidores en la aplicación del Código de Protección y Defensa del Consumidor y la normativa de represión de la competencia desleal ante el INDECOPI.",
        servicios: [
            "Patrocinio en procedimientos sancionadores por infracción a los derechos del consumidor ante INDECOPI",
            "Auditoría preventiva del Libro de Reclamaciones, contratos de adhesión y garantías comerciales",
            "Revisión legal de campañas publicitarias, promociones comerciales y rotulado de productos",
            "Denuncias y defensa por actos de competencia desleal (engaño, confusión, denigración)",
            "Procedimientos de eliminación de barreras burocráticas ilegales o carentes de razonabilidad"
        ],
        situaciones: [
            "Notificación de reclamos o denuncias administrativas promovidas ante el INDECOPI",
            "Validación legal previa al lanzamiento de promociones o publicidad comercial",
            "Afectación empresarial por prácticas desleales de competidores o trabas municipales ilegales"
        ],
        activo: true
    },
    {
        id: 11,
        slug: "procedimientos-concursales",
        nombre: "Procedimientos Concursales",
        icono: "fa-solid fa-chart-line",
        imagen: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
        resumen: "Reestructuración patrimonial, reconocimiento de créditos y liquidación ordenada ante INDECOPI.",
        descripcion: "Brindamos asesoría especializada tanto a empresas en situación de crisis patrimonial como a acreedores que buscan tutelar la recuperación de sus créditos dentro del sistema concursal peruano.",
        servicios: [
            "Acogimiento a procedimientos concursales preventivos y ordinarios ante INDECOPI",
            "Solicitudes de reconocimiento de créditos (laborales, comerciales, garantizados y tributarios)",
            "Representación e intervención estratégica en Juntas de Acreedores",
            "Elaboración y negociación de Planes de Reestructuración Patrimonial",
            "Asesoría en Convenios de Liquidación y salida ordenada del mercado"
        ],
        situaciones: [
            "Empresas que atraviesan crisis de liquidez o cesación de pagos y requieren protección patrimonial",
            "Acreedores cuyos clientes han sido sometidos a concurso ante el INDECOPI",
            "Negociación de reprogramación global de pasivos bajo el marco concursal"
        ],
        activo: true
    },
    {
        id: 12,
        slug: "propiedad-intelectual",
        nombre: "Propiedad Intelectual",
        icono: "fa-solid fa-lightbulb",
        imagen: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80",
        resumen: "Registro y defensa de marcas, patentes, nombres comerciales y derechos de autor.",
        descripcion: "Protegemos los activos intangibles, la identidad comercial y las creaciones intelectuales de empresas y emprendedores mediante su registro y defensa ante el INDECOPI.",
        servicios: [
            "Búsqueda de antecedentes fonéticos y figurativos y registro de marcas de producto o servicio",
            "Registro de nombres comerciales, lemas comerciales y marcas colectivas",
            "Oposiciones al registro de signos similares y defensa frente a oposiciones de terceros",
            "Acciones por infracción a los derechos de propiedad industrial y medidas cautelares",
            "Registro de obras literarias, artísticas y software ante la Dirección de Derecho de Autor"
        ],
        situaciones: [
            "Lanzamiento de una nueva marca, logotipo o nombre comercial que requiere exclusividad legal",
            "Detección de terceros que utilizan sin autorización una marca idéntica o similar a la suya",
            "Contratos de licencia de uso de marca, cesión de derechos o franquicias"
        ],
        activo: true
    },
    {
        id: 13,
        slug: "derecho-tributario",
        nombre: "Derecho Tributario",
        icono: "fa-solid fa-file-invoice-dollar",
        imagen: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80",
        resumen: "Planeamiento fiscal, atención de fiscalizaciones ante SUNAT y recursos ante el Tribunal Fiscal.",
        descripcion: "Asesoramos en el cumplimiento eficiente de las obligaciones tributarias del Gobierno Central y Gobiernos Locales, ejerciendo el patrocinio en procedimientos de fiscalización y contencioso-tributarios.",
        servicios: [
            "Consultoría y planeamiento tributario corporativo y patrimonial",
            "Acompañamiento legal durante procedimientos de fiscalización definitiva o parcial de SUNAT",
            "Recursos de reclamación ante SUNAT y apelación ante el Tribunal Fiscal",
            "Procedimientos de cobranza coactiva, prescripción de deuda tributaria y quejas",
            "Tributación municipal: impuesto predial, alcabala y arbitrios municipales"
        ],
        situaciones: [
            "Notificación de cartas de presentación, requerimientos o esquelas de citación de SUNAT",
            "Emisión de Resoluciones de Determinación o Resoluciones de Multa que requieren impugnación",
            "Evaluación del impacto tributario antes de celebrar contratos inmobiliarios o societarios"
        ],
        activo: true
    }
];

function obtenerAreasLegales() {
    const guardadas = localStorage.getItem('ureta_areas_db');
    if (guardadas) {
        return JSON.parse(guardadas);
    }
    localStorage.setItem('ureta_areas_db', JSON.stringify(AREAS_INICIALES));
    return AREAS_INICIALES;
}


// =========================================================================
// 3. BASE DE DATOS DE RESPALDO: NUESTRO STAFF (ABOGADOS)
// =========================================================================
const STAFF_INICIAL = [
    {
        id: 1,
        nombre: "Peter Hans Ureta Escobedo",
        cargo: "Socio Fundador / Director General",
        especialidades: ["Derecho Corporativo", "Derecho Civil", "Área Arbitral"],
        colegiatura: "CAA (Reg. Oficial)",
        foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80",
        formacion: "Abogado titulado con estudios de posgrado y especialización en Derecho Constitucional, Civil y Corporativo.",
        experiencia: "Amplia trayectoria en el patrocinio de empresas, estructuración societaria, litigios civiles de alta complejidad y procesos constitucionales.",
        cursos: "Especialización en Derecho Procesal Constitucional, Arbitraje Comercial y Contrataciones con el Estado.",
        biografia: "Dirige la estrategia jurídica integral del Estudio Ureta & Asociados, promoviendo soluciones preventivas y patrocinio de excelencia técnica.",
        correo: "contacto@estudio-ureta.com",
        activo: true
    },
    {
        id: 2,
        nombre: "Dra. Geraldine Valencia Sotomayor",
        cargo: "Abogada Asociada / Especialista Penal",
        especialidades: ["Derecho Penal", "Derecho Administrativo"],
        colegiatura: "CAA (Reg. Oficial)",
        foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80",
        formacion: "Abogada especialista en Ciencias Penales y Litigación Oral bajo el Nuevo Código Procesal Penal.",
        experiencia: "Patrocinio en investigaciones preliminares, audiencias de tutela de derechos, oposición a medidas coercitivas y defensa técnica en juicio oral.",
        cursos: "Diplomados en Derecho Penal Económico, Compliance Corporativo y Teoría del Delito.",
        biografia: "Autora de investigaciones jurídicas sobre el principio de proporcionalidad en la prisión preventiva y garantías procesales.",
        correo: "contacto@estudio-ureta.com",
        activo: true
    },
    {
        id: 3,
        nombre: "Abogado Especialista Asociado",
        cargo: "Jefe del Área Civil e Inmobiliaria",
        especialidades: ["Saneamiento de Propiedades", "Derecho Civil", "Recuperaciones"],
        colegiatura: "Registro Habilitado",
        foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80",
        formacion: "Abogado con especialización en Derecho Registral, Notarial e Inmobiliario.",
        experiencia: "Saneamiento físico-legal de predios urbanos y rurales, prescripción adquisitiva de dominio, estudio de títulos y recuperación de carteras.",
        cursos: "Actualización en Precedentes de Observancia Obligatoria del Tribunal Registral (SUNARP).",
        biografia: "Integra el Área Judicial de Derecho Civil, enfocado en la seguridad jurídica del patrimonio inmobiliario y contractual.",
        correo: "contacto@estudio-ureta.com",
        activo: true
    },
    {
        id: 4,
        nombre: "Abogada Especialista Asociada",
        cargo: "Coordinadora Laboral y Corporativa",
        especialidades: ["Derecho Laboral", "Competencia y Protección del Consumidor", "Propiedad Intelectual"],
        colegiatura: "Registro Habilitado",
        foto: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=700&q=80",
        formacion: "Abogada especialista en Derecho del Trabajo, Seguridad Social y Derecho de la Competencia.",
        experiencia: "Prevención de contingencias laborales, atención de fiscalizaciones ante SUNAFIL y procedimientos administrativos ante INDECOPI.",
        cursos: "Especialización en Inspección del Trabajo, Propiedad Industrial y Protección al Consumidor.",
        biografia: "Brinda acompañamiento preventivo continuo a empresas para el cumplimiento normativo laboral y regulatorio.",
        correo: "contacto@estudio-ureta.com",
        activo: true
    }
];

function obtenerStaff() {
    const guardado = localStorage.getItem('ureta_staff_db');
    if (guardado) return JSON.parse(guardado);
    localStorage.setItem('ureta_staff_db', JSON.stringify(STAFF_INICIAL));
    return STAFF_INICIAL;
}


// =========================================================================
// 4. BASE DE DATOS DE RESPALDO: BLOG / ACTUALIDAD JURÍDICA
// =========================================================================
const BLOG_INICIAL = [
    {
        id: 101,
        titulo: "La objeción de conciencia en el Perú",
        subtitulo: "Alcances constitucionales, interpretación del Tribunal Constitucional y colisión entre convicciones personales y normas.",
        categoria: "Opinión jurídica",
        tipo: "ArticuloPropio",
        autor: "Peter Hans Ureta Escobedo",
        fecha: "2026-08-15",
        destacado: true,
        estado: "Publicado",
        imagen: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?auto=format&fit=crop&w=1000&q=80",
        contenido: `
            <p>El presente artículo analiza y explora los alcances del derecho a la objeción de conciencia de una persona, desde lo contenido en la Constitución Política del Perú como norma suprema, hasta la interpretación del Tribunal Constitucional sobre los casos en que se ha reclamado el respeto de los principios que motivan e inspiran a desafiar regulaciones en diversos ámbitos sociales, laborales o académicos.</p>
            <h4>1. Fundamento Constitucional</h4>
            <p>La libertad de conciencia y de religión, reconocida en el artículo 2 inciso 3 de la Constitución, garantiza que nadie sea obligado a actuar en contra de sus convicciones éticas o religiosas profundas, siempre que dicho ejercicio no vulnere el orden público ni derechos fundamentales de terceros.</p>
            <h4>2. Criterios Jurisprudenciales</h4>
            <p>La jurisprudencia constitucional ha establecido que la objeción de conciencia requiere acreditar la existencia de un deber jurídico válido y una convicción moral o religiosa seria, sincera y verificable que entre en conflicto directo con dicho mandato.</p>
        `,
        fuenteNombre: "",
        fuenteUrl: ""
    },
    {
        id: 102,
        titulo: "El amparo electoral: Análisis funcional y desarrollo en el Tribunal Constitucional",
        subtitulo: "Revisión de los antecedentes del proceso constitucional de amparo en materia electoral y sus criterios de procedencia.",
        categoria: "Derecho Civil",
        tipo: "AnalisisJuridico",
        autor: "Área Judicial de Derecho Civil",
        fecha: "2026-09-10",
        destacado: false,
        estado: "Publicado",
        imagen: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&w=1000&q=80",
        contenido: `
            <p>Debemos comenzar revisando los antecedentes del proceso constitucional de amparo frente a resoluciones emitidas en materia electoral y la evolución de la tutela de urgencia cuando se afectan derechos fundamentales vinculados a la participación política y al debido proceso.</p>
            <h4>Estructura del Análisis</h4>
            <ul>
                <li>I. Introducción y marco constitucional.</li>
                <li>II. Análisis funcional del amparo electoral en el ordenamiento peruano.</li>
                <li>III. Desarrollo jurisprudencial del Tribunal Constitucional.</li>
                <li>IV. Conclusiones y garantías del debido proceso.</li>
            </ul>
        `,
        fuenteNombre: "",
        fuenteUrl: ""
    },
    {
        id: 103,
        titulo: "El principio de proporcionalidad en la prisión preventiva",
        subtitulo: "Evaluación de los presupuestos materiales y el carácter excepcional de las medidas coercitivas personales.",
        categoria: "Derecho Penal",
        tipo: "ArticuloPropio",
        autor: "Dra. Geraldine Valencia Sotomayor",
        fecha: "2026-10-02",
        destacado: false,
        estado: "Publicado",
        imagen: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1000&q=80",
        contenido: `
            <p>La prisión preventiva, al tener como objetivo restringir la libertad ambulatoria de una persona procesada durante el tiempo que dure el proceso penal a fin de asegurar su presencia y evitar la obstaculización de la averiguación de la verdad, constituye una medida coercitiva sumamente gravosa que debe regirse estrictamente por el principio de proporcionalidad.</p>
            <h4>Subprincipios exigibles en audiencia</h4>
            <p>Todo requerimiento fiscal debe superar el test de idoneidad, necesidad y proporcionalidad en sentido estricto, priorizando medidas menos lesivas como la comparecencia con restricciones cuando el peligro procesal pueda neutralizarse por otros medios.</p>
        `,
        fuenteNombre: "",
        fuenteUrl: ""
    },
    {
        id: 104,
        titulo: "SUNARP e INDECOPI: Novedades en trámites registrales electrónicos y fiscalización comercial",
        subtitulo: "Enlace a las disposiciones oficiales sobre simplificación registral y criterios de prevención para empresas.",
        categoria: "Actualidad jurídica",
        tipo: "NoticiaExterna",
        autor: "Redacción Institucional",
        fecha: "2026-10-24",
        destacado: false,
        estado: "Publicado",
        imagen: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
        contenido: `
            <p>Las recientes actualizaciones en los servicios digitales de la Superintendencia Nacional de los Registros Públicos (SUNARP) y los lineamientos preventivos del INDECOPI exigen que las empresas actualicen sus protocolos contractuales y registrales.</p>
            <p>Puede consultar la publicación normativa original en el enlace oficial adjunto al pie de esta nota.</p>
        `,
        fuenteNombre: "Diario Oficial El Peruano / Normas Legales",
        fuenteUrl: "https://busquedas.elperuano.pe/"
    }
];

function obtenerBlog() {
    const guardado = localStorage.getItem('ureta_blog_db');
    if (guardado) return JSON.parse(guardado);
    localStorage.setItem('ureta_blog_db', JSON.stringify(BLOG_INICIAL));
    return BLOG_INICIAL;
}


// =========================================================================
// 5. BASE DE DATOS DE RESPALDO: VACANTES LABORALES
// =========================================================================
const VACANTES_INICIALES = [
    {
        id: 201,
        puesto: "Abogado(a) Asociado(a) en Derecho Civil y Procesal Civil",
        area: "Derecho Civil",
        descripcion: "Buscamos un profesional con sólida capacidad de análisis jurídico, redacción de escritos judiciales y patrocinio en audiencias civiles e inmobiliarias.",
        requisitos: [
            "Título profesional de Abogado(a) y colegiatura habilitada",
            "Experiencia mínima de 2 años en litigios civiles o saneamiento de propiedades",
            "Dominio del Código Civil y Código Procesal Civil"
        ],
        modalidad: "Presencial (Yanahuara - Arequipa)",
        fechaPublicacion: "2026-11-01",
        fechaLimite: "2026-12-15",
        activa: true
    },
    {
        id: 202,
        puesto: "Practicante Preprofesional de Derecho",
        area: "Derecho Corporativo",
        descripcion: "Convocatoria dirigida a estudiantes de los últimos años de la Facultad de Derecho con interés en trámites registrales (SUNARP), societarios y apoyo procesal.",
        requisitos: [
            "Cursar entre el 9.° y 12.° ciclo de la carrera de Derecho",
            "Pertenecer al tercio o quinto superior (deseable)",
            "Excelente redacción jurídica, proactividad y compromiso ético"
        ],
        modalidad: "Semi-presencial / Híbrido",
        fechaPublicacion: "2026-11-05",
        fechaLimite: "2026-12-20",
        activa: true
    }
];

function obtenerVacantes() {
    const guardadas = localStorage.getItem('ureta_vacantes_db');
    if (guardadas) return JSON.parse(guardadas);
    localStorage.setItem('ureta_vacantes_db', JSON.stringify(VACANTES_INICIALES));
    return VACANTES_INICIALES;
}


// =========================================================================
// 6. SINCRONIZACIÓN ULTRA RÁPIDA EN PARALELO (INCLUYE CONSULTAS Y POSTULACIONES)
// =========================================================================
let promesaSincronizacion = null;

async function sincronizarVistasSupabase() {
    if (!supabaseEstaConfigurado()) return;
    if (promesaSincronizacion) return promesaSincronizacion;

    promesaSincronizacion = (async () => {
        try {
            const [
                areasDB,
                staffDB,
                blogDB,
                vacDB,
                portadasDB,
                testDB,
                configArr,
                contactosDB,
                postDB
            ] = await Promise.all([
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
                    id: a.area_id,
                    slug: a.slug,
                    nombre: a.nombre,
                    icono: a.icono_clase,
                    imagen: a.imagen_url,
                    resumen: a.resumen_tarjeta,
                    descripcion: a.descripcion_servicio,
                    servicios: Array.isArray(a.servicios_ofrecidos) ? a.servicios_ofrecidos : [],
                    situaciones: Array.isArray(a.situaciones_asesoria) ? a.situaciones_asesoria : [],
                    activo: a.activo
                }))));
            }

            if (staffDB && staffDB.length > 0) {
                localStorage.setItem('ureta_staff_db', JSON.stringify(staffDB.map(s => ({
                    id: s.abogado_id,
                    nombre: s.nombre_completo,
                    cargo: s.cargo,
                    colegiatura: s.numero_colegiatura || 'Registro Oficial',
                    foto: s.foto_url,
                    especialidades: Array.isArray(s.especialidades) ? s.especialidades : [],
                    formacion: s.formacion_academica || '',
                    experiencia: s.experiencia_profesional || '',
                    cursos: s.cursos_especializaciones || 'Especialización continua',
                    biografia: s.biografia || '',
                    correo: s.correo_profesional || 'contacto@estudio-ureta.com',
                    activo: s.activo
                }))));
            }

            if (blogDB && blogDB.length > 0) {
                localStorage.setItem('ureta_blog_db', JSON.stringify(blogDB.map(b => ({
                    id: b.publicacion_id,
                    titulo: b.titulo,
                    subtitulo: b.subtitulo,
                    categoria: b.categoria_nombre,
                    tipo: b.tipo_codigo,
                    autor: b.autor,
                    fecha: b.fecha_publicacion,
                    destacado: b.destacado,
                    estado: b.estado,
                    imagen: b.imagen_url,
                    contenido: b.contenido_html,
                    fuenteNombre: b.fuente_nombre || '',
                    fuenteUrl: b.fuente_url_original || ''
                }))));
            }

            if (vacDB && vacDB.length > 0) {
                localStorage.setItem('ureta_vacantes_db', JSON.stringify(vacDB.map(v => ({
                    id: v.vacante_id,
                    puesto: v.nombre_puesto,
                    area: v.area_nombre,
                    descripcion: v.descripcion,
                    requisitos: Array.isArray(v.requisitos) ? v.requisitos : [],
                    modalidad: v.modalidad,
                    fechaPublicacion: v.fecha_publicacion,
                    fechaLimite: v.fecha_limite,
                    activa: v.activa
                }))));
            }

            // Sincronizar Solicitudes de Contacto para admin.html
            if (Array.isArray(contactosDB)) {
                localStorage.setItem('ureta_contactos_db', JSON.stringify(contactosDB.map(c => ({
                    id: c.solicitud_id,
                    nombres: c.nombres_apellidos,
                    correo: c.correo_electronico,
                    telefono: c.telefono,
                    empresa: c.empresa || '',
                    area: c.nombre_area_texto || 'Consulta General',
                    asunto: c.asunto,
                    descripcion: c.descripcion_consulta,
                    estado: c.estado_gestion || 'Nueva',
                    observaciones: c.observaciones_internas || '',
                    fecha: c.fecha_registro ? new Date(c.fecha_registro).toLocaleString('es-PE') : ''
                }))));
            }

            // Sincronizar Postulaciones y CVs para admin.html
            if (Array.isArray(postDB)) {
                localStorage.setItem('ureta_postulaciones_db', JSON.stringify(postDB.map(p => ({
                    id: p.postulacion_id,
                    nombres: p.nombres_apellidos,
                    documento: p.documento_identidad,
                    correo: p.correo,
                    telefono: p.telefono,
                    profesion: p.profesion,
                    puesto: p.puesto_postula,
                    experiencia: p.resumen_experiencia,
                    mensaje: p.mensaje_presentacion || '',
                    nombreArchivoCv: p.nombre_archivo_cv,
                    url_archivo_cv: p.url_archivo_cv,
                    tamanoKb: p.tamano_kb,
                    estado: p.estado_postulacion || 'Recibida',
                    fecha: p.fecha_postulacion ? new Date(p.fecha_postulacion).toLocaleString('es-PE') : ''
                }))));
            }

            if (portadasDB) localStorage.setItem('ureta_portadas_cache', JSON.stringify(portadasDB));
            if (testDB) localStorage.setItem('ureta_testimonios_cache', JSON.stringify(testDB));
            if (configArr && configArr[0]) localStorage.setItem('ureta_config_cache', JSON.stringify(configArr[0]));

        } catch (err) {
            console.warn('Error sincronizando vistas de Supabase:', err);
        } finally {
            promesaSincronizacion = null;
        }
    })();

    return promesaSincronizacion;
}

sincronizarVistasSupabase();

// =========================================================================
// 7. SUBIDA DIRECTA DE IMÁGENES A SUPABASE STORAGE (imagenes_web)
// =========================================================================
async function subirImagenWebSupabase(archivo, carpeta = 'general') {
    if (!archivo) return null;
    if (!supabaseEstaConfigurado()) {
        alert('Supabase no está configurado.');
        return null;
    }

    // Limpiar nombre de archivo y evitar colisiones
    const ext = archivo.name.split('.').pop().toLowerCase() || 'jpg';
    const nombreLimpio = `${carpeta}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/imagenes_web/${nombreLimpio}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': archivo.type || 'image/jpeg',
            'x-upsert': 'true'
        },
        body: archivo
    });

    if (!resp.ok) {
        const errTxt = await resp.text();
        console.error('Error al subir imagen a Supabase:', errTxt);
        alert('No se pudo subir la imagen. Verifica que pese menos de 5 MB y sea JPG, PNG o WEBP.');
        return null;
    }

    return `${SUPABASE_URL}/storage/v1/object/public/imagenes_web/${nombreLimpio}`;
}

// Helper genérico REST para CRUD de tablas directas (eventos_academicos, historias_carrera, areas_legales)
async function supabaseRest(tabla, metodo = 'GET', query = '', body = null) {
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    const opciones = { method: metodo, headers };
    if (body) opciones.body = JSON.stringify(body);

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}${query}`, opciones);
    if (!resp.ok) {
        console.error(`Error REST [${metodo}] ${tabla}:`, await resp.text());
        return null;
    }
    return metodo === 'DELETE' ? true : await resp.json();
}