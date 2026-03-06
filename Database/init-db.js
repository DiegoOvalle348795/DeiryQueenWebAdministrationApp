/**
 * Script para inicializar la base de datos mantenimientos_dq.
 * Usa MONGODB_URI de .env.local
 *
 * Ejecutar: node Database/init-db.js
 * O: npm run db:init
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Cargar .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local no encontrado");
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI no está definida en .env.local");
  process.exit(1);
}

const DB_NAME = "mantenimientos_dq";

const usuariosValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["nombre", "email", "rol", "activo", "created_at"],
    properties: {
      _id: { bsonType: "objectId" },
      nombre: { bsonType: "string", description: "Nombre completo del usuario" },
      email: { bsonType: "string", pattern: "^.+@.+\\..+$", description: "Correo electrónico con formato válido" },
      rol: { bsonType: "string", enum: ["administrador", "usuario", "gerente", "tecnico", "jefe_tecnico"], description: "Rol del usuario" },
      sucursal_id: { bsonType: ["objectId", "null"], description: "Sucursal asociada (si aplica)" },
      activo: { bsonType: "bool", description: "Indica si el usuario está activo" },
      created_at: { bsonType: "date", description: "Fecha de creación del usuario" },
    },
  },
};

const sucursalesValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["nombre", "activo"],
    properties: {
      _id: { bsonType: "objectId" },
      nombre: { bsonType: "string", description: "Nombre de la sucursal" },
      direccion: { bsonType: ["string", "null"] },
      estado: { bsonType: ["string", "null"] },
      activo: { bsonType: "bool", description: "Indica si la sucursal está activa" },
      meta: { bsonType: ["object", "null"], description: "Datos extra (teléfono, coordenadas, etc.)" },
    },
  },
};

const maquinasValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["nombre", "tipo", "sucursal_id", "activo"],
    properties: {
      _id: { bsonType: "objectId" },
      hash_contraseña: { bsonType: "string", description: "Hash de la contraseña" },
      nombre: { bsonType: "string", description: "Identificador de la máquina" },
      numero_serie: { bsonType: ["string", "null"], description: "Número de serie de la máquina" },
      tipo: { bsonType: "string", enum: ["duke", "taylor"], description: "Tipo de máquina" },
      modelo: { bsonType: ["string", "null"] },
      sucursal_id: { bsonType: "objectId", description: "Referencia a sucursal" },
      activo: { bsonType: "bool", description: "Indica si la máquina está activa" },
      current_mantenimiento_id: { bsonType: ["objectId", "null"], description: "Mantenimiento en curso (si existe)" },
      tiene_en_proceso: { bsonType: ["bool", "null"], description: "Flag rápido para saber si hay mantenimiento en proceso" },
      ultimo_mantenimiento_fecha: { bsonType: ["date", "null"] },
      ultimo_tipo_mantenimiento: { bsonType: ["string", "null"], enum: ["preventivo", "correctivo"], description: "Tipo de último mantenimiento" },
      meta: { bsonType: ["object", "null"] },
    },
  },
};

const plantillasProcesoValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["tipo_maquina", "tipo_mantenimiento", "activo", "version", "pasos"],
    properties: {
      _id: { bsonType: "objectId" },
      tipo_maquina: { bsonType: "string", enum: ["duke", "taylor"], description: "Tipo de máquina al que aplica la plantilla" },
      tipo_mantenimiento: { bsonType: "string", enum: ["preventivo", "correctivo"], description: "Tipo de mantenimiento" },
      nombre: { bsonType: ["string", "null"] },
      descripcion: { bsonType: ["string", "null"] },
      pasos: {
        bsonType: "array",
        minItems: 1,
        maxItems: 200,
        items: {
          bsonType: "object",
          required: ["id", "orden", "nombre", "rol_autorizado", "requiere_evidencia", "requiere_firma"],
          properties: {
            id: { bsonType: "int", description: "Id interno del paso en la plantilla" },
            orden: { bsonType: "int", description: "Orden explícito del paso" },
            nombre: { bsonType: "string" },
            rol_autorizado: {
              description: "Rol(es) que pueden ejecutar el paso",
              oneOf: [{ bsonType: "string" }, { bsonType: "array", items: { bsonType: "string" } }],
            },
            requiere_evidencia: { bsonType: "bool" },
            requiere_firma: { bsonType: "bool" },
            tiempo_max_segundos: { bsonType: ["int", "long", "null"] },
            puede_retroceder: { bsonType: ["bool", "null"] },
            meta: { bsonType: ["object", "null"] },
          },
        },
      },
      activo: { bsonType: "bool", description: "Indica si la plantilla está vigente" },
      version: { bsonType: "int", description: "Versión de la plantilla" },
    },
  },
};

const mantenimientosValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["maquina_id", "sucursal_id", "tipo_mantenimiento", "tipo_maquina", "estado", "fecha_solicitud", "creado_por", "cancelado", "pasos"],
    properties: {
      _id: { bsonType: "objectId" },
      maquina_id: { bsonType: "objectId", description: "Referencia a la máquina" },
      sucursal_id: { bsonType: "objectId", description: "Sucursal redundante para consultas" },
      tipo_mantenimiento: { bsonType: "string", enum: ["preventivo", "correctivo"] },
      tipo_maquina: { bsonType: "string", enum: ["duke", "taylor"] },
      estado: { bsonType: "string", enum: ["pendiente", "en_proceso", "finalizado", "cancelado"] },
      fecha_solicitud: { bsonType: "date" },
      fecha_inicio: { bsonType: ["date", "null"] },
      fecha_fin: { bsonType: ["date", "null"] },
      creado_por: { bsonType: "objectId" },
      asignado_a: { bsonType: ["objectId", "null"] },
      plantilla_id: { bsonType: ["objectId", "null"], description: "Referencia a la plantilla usada" },
      pasos: {
        bsonType: "array",
        minItems: 1,
        maxItems: 200,
        description: "Copia embebida de los pasos de la plantilla",
        items: {
          bsonType: "object",
          required: ["id", "orden", "nombre", "estado"],
          properties: {
            id: { bsonType: "int" },
            orden: { bsonType: "int" },
            nombre: { bsonType: "string" },
            estado: { bsonType: "string", enum: ["pendiente", "en_proceso", "completado", "bloqueado"] },
            completado_por: { bsonType: ["objectId", "null"] },
            completado_en: { bsonType: ["date", "null"] },
            evidencias_ids: { bsonType: ["array", "null"], items: { bsonType: "objectId" }, description: "Evidencias asociadas a este paso" },
            meta: { bsonType: ["object", "null"] },
          },
        },
      },
      evidencias_globales_ids: { bsonType: ["array", "null"], items: { bsonType: "objectId" }, description: "Evidencias generales del mantenimiento" },
      cancelado: { bsonType: "bool" },
      cancelado_por: { bsonType: ["objectId", "null"] },
      cancelado_en: { bsonType: ["date", "null"] },
      motivo_cancelacion: { bsonType: ["string", "null"] },
      created_at: { bsonType: ["date", "null"] },
      updated_at: { bsonType: ["date", "null"] },
    },
  },
};

const evidenciasValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["mantenimiento_id", "tipo", "url", "subido_por", "subido_en"],
    properties: {
      _id: { bsonType: "objectId" },
      mantenimiento_id: { bsonType: "objectId", description: "Referencia al mantenimiento" },
      paso_id: { bsonType: ["int", "null"], description: "Id de paso en la plantilla/mantenimiento (si aplica)" },
      tipo: { bsonType: "string", enum: ["foto", "pdf", "firma", "otro"], description: "Tipo general de evidencia" },
      subtipo: { bsonType: ["string", "null"], description: "Subtipo específico (opcional)" },
      url: { bsonType: "string", description: "URL en la nube" },
      nombre_archivo: { bsonType: ["string", "null"] },
      tamano_bytes: { bsonType: ["long", "int", "null"] },
      subido_por: { bsonType: "objectId" },
      subido_en: { bsonType: "date" },
      metadatos: { bsonType: ["object", "null"], description: "Campos extra (firma_nombre, hash, mime, etc.)" },
    },
  },
};

async function createCollectionIfNotExists(db, name, options) {
  const collections = await db.listCollections({ name }).toArray();
  if (collections.length > 0) {
    console.log(`  Colección "${name}" ya existe, omitiendo.`);
    return;
  }
  await db.createCollection(name, options);
  console.log(`  Colección "${name}" creada.`);
}

async function createIndexIfNotExists(collection, spec, options = {}) {
  const indexes = await collection.indexes();
  const keyStr = JSON.stringify(spec);
  const exists = indexes.some((idx) => JSON.stringify(idx.key) === keyStr);
  if (exists) {
    console.log(`  Índice ya existe en ${collection.collectionName}: ${keyStr}`);
    return;
  }
  await collection.createIndex(spec, options);
  console.log(`  Índice creado en ${collection.collectionName}: ${keyStr}`);
}

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Conectado a MongoDB.\n");

    const db = client.db(DB_NAME);

    // 1) usuarios
    console.log("1) usuarios");
    await createCollectionIfNotExists(db, "usuarios", {
      validator: usuariosValidator,
      validationLevel: "moderate",
    });
    const usuarios = db.collection("usuarios");
    await createIndexIfNotExists(usuarios, { email: 1 }, { unique: true });
    await createIndexIfNotExists(usuarios, { sucursal_id: 1 });

    // 2) sucursales
    console.log("\n2) sucursales");
    await createCollectionIfNotExists(db, "sucursales", {
      validator: sucursalesValidator,
      validationLevel: "moderate",
    });
    const sucursales = db.collection("sucursales");
    await createIndexIfNotExists(sucursales, { nombre: 1 });

    // 3) maquinas
    console.log("\n3) maquinas");
    await createCollectionIfNotExists(db, "maquinas", {
      validator: maquinasValidator,
      validationLevel: "moderate",
    });
    const maquinas = db.collection("maquinas");
    await createIndexIfNotExists(maquinas, { sucursal_id: 1, tipo: 1 });
    await createIndexIfNotExists(maquinas, { sucursal_id: 1, numero_serie: 1 }, { unique: true, sparse: true });
    await createIndexIfNotExists(maquinas, { current_mantenimiento_id: 1 });

    // 4) plantillas_proceso
    console.log("\n4) plantillas_proceso");
    await createCollectionIfNotExists(db, "plantillas_proceso", {
      validator: plantillasProcesoValidator,
      validationLevel: "moderate",
    });
    const plantillasProceso = db.collection("plantillas_proceso");
    await createIndexIfNotExists(plantillasProceso, { tipo_maquina: 1, tipo_mantenimiento: 1, version: 1 }, { unique: true });

    // 5) mantenimientos
    console.log("\n5) mantenimientos");
    await createCollectionIfNotExists(db, "mantenimientos", {
      validator: mantenimientosValidator,
      validationLevel: "moderate",
    });
    const mantenimientos = db.collection("mantenimientos");
    await createIndexIfNotExists(mantenimientos, { maquina_id: 1, estado: 1, fecha_inicio: -1 });
    await createIndexIfNotExists(mantenimientos, { sucursal_id: 1, estado: 1 });

    // 6) evidencias
    console.log("\n6) evidencias");
    await createCollectionIfNotExists(db, "evidencias", {
      validator: evidenciasValidator,
      validationLevel: "moderate",
    });
    const evidencias = db.collection("evidencias");
    await createIndexIfNotExists(evidencias, { mantenimiento_id: 1, subido_en: -1 });

    console.log("\n✓ Base de datos inicializada correctamente.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
