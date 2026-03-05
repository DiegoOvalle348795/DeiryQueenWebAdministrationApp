// Seleccionar base de datos
use("mantenimientos_dq");

/*
  NOTA DE DISEÑO:
  - En la colección mantenimientos renombro el campo global de evidencias de "evidencias_ids"
    a "evidencias_globales_ids" para no confundirlo con el de cada paso.
*/

/* =========================
   1) usuarios
   ========================= */
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "email", "rol", "activo", "created_at"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        nombre: {
          bsonType: "string",
          description: "Nombre completo del usuario"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+\\..+$",
          description: "Correo electrónico con formato válido"
        },
        rol: {
          bsonType: "string",
          enum: ["administrador", "usuario", "gerente", "tecnico", "jefe_tecnico"],
          description: "Rol del usuario"
        },
        sucursal_id: {
          bsonType: ["objectId", "null"],
          description: "Sucursal asociada (si aplica)"
        },
        activo: {
          bsonType: "bool",
          description: "Indica si el usuario está activo"
        },
        created_at: {
          bsonType: "date",
          description: "Fecha de creación del usuario"
        }
      }
    }
  },
  validationLevel: "moderate"
});

// Índices usuarios
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.usuarios.createIndex({ sucursal_id: 1 });


/* =========================
   2) sucursales
   ========================= */
db.createCollection("sucursales", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "activo"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        nombre: {
          bsonType: "string",
          description: "Nombre de la sucursal"
        },
        direccion: {
          bsonType: ["string", "null"]
        },
        estado: {
          bsonType: ["string", "null"]
        },
        activo: {
          bsonType: "bool",
          description: "Indica si la sucursal está activa"
        },
        meta: {
          bsonType: ["object", "null"],
          description: "Datos extra (teléfono, coordenadas, etc.)"
        }
      }
    }
  },
  validationLevel: "moderate"
});

// Índices sucursales
db.sucursales.createIndex({ nombre: 1 });


/* =========================
   3) maquinas
   ========================= */
db.createCollection("maquinas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "tipo", "sucursal_id", "activo"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        hash_contraseña: {
          bsonType: "string",
          description: "Hash de la contraseña"
        },
        nombre: {
          bsonType: "string",
          description: "Identificador de la máquina"
        },
        numero_serie: {
          bsonType: ["string", "null"],
          description: "Número de serie de la máquina"
        },
        tipo: {
          bsonType: "string",
          enum: ["duke", "taylor"],
          description: "Tipo de máquina"
        },
        modelo: {
          bsonType: ["string", "null"]
        },
        sucursal_id: {
          bsonType: "objectId",
          description: "Referencia a sucursal"
        },
        activo: {
          bsonType: "bool",
          description: "Indica si la máquina está activa"
        },
        current_mantenimiento_id: {
          bsonType: ["objectId", "null"],
          description: "Mantenimiento en curso (si existe)"
        },//--------------------------------------------------------------------------
        tiene_en_proceso: {
          bsonType: ["bool", "null"],
          description: "Flag rápido para saber si hay mantenimiento en proceso"
        },
        ultimo_mantenimiento_fecha: {                                         //sacar informacion de 
          bsonType: ["date", "null"]                                          //del proceso  manual                      
        },
        ultimo_tipo_mantenimiento: {
          bsonType: ["string", "null"],
          enum: [null, "preventivo", "correctivo"],
          description: "Tipo de último mantenimiento"
        },//-----------------------------------------------------------------------------
        meta: {
          bsonType: ["object", "null"]
        }
      }
    }
  },
  validationLevel: "moderate"
});

// Índices maquinas
db.maquinas.createIndex({ sucursal_id: 1, tipo: 1 });
db.maquinas.createIndex(
  { sucursal_id: 1, numero_serie: 1 },
  { unique: true, sparse: true }//maquina con numero de serie en la misma sucursal no pueden repetirse, maquinas sin numero de serie si 
);
db.maquinas.createIndex({ current_mantenimiento_id: 1 });


/* =========================
   4) plantillas_proceso
   ========================= */
db.createCollection("plantillas_proceso", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tipo_maquina", "tipo_mantenimiento", "activo", "version", "pasos"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        tipo_maquina: {
          bsonType: "string",
          enum: ["duke", "taylor"],
          description: "Tipo de máquina al que aplica la plantilla"
        },
        tipo_mantenimiento: {
          bsonType: "string",
          enum: ["preventivo", "correctivo"],
          description: "Tipo de mantenimiento"
        },
        nombre: {
          bsonType: ["string", "null"]
        },
        descripcion: {
          bsonType: ["string", "null"]
        },
        pasos: {
          bsonType: "array",
          minItems: 1,
          maxItems: 200,
          items: {
            bsonType: "object",
            required: ["id", "orden", "nombre", "rol_autorizado", "requiere_evidencia", "requiere_firma"],
            properties: {
              id: {
                bsonType: "int",
                description: "Id interno del paso en la plantilla"
              },
              orden: {
                bsonType: "int",
                description: "Orden explícito del paso"
              },
              nombre: {
                bsonType: "string"
              },
              rol_autorizado: {
                description: "Rol(es) que pueden ejecutar el paso",
                oneOf: [
                  {
                    bsonType: "string"
                  },
                  {
                    bsonType: "array",
                    items: {
                      bsonType: "string"
                    }
                  }
                ]
              },
              requiere_evidencia: {
                bsonType: "bool"
              },
              requiere_firma: {
                bsonType: "bool"
              },
              tiempo_max_segundos: {
                bsonType: ["int", "long", "null"]
              },
              puede_retroceder: {
                bsonType: ["bool", "null"]
              },
              meta: {
                bsonType: ["object", "null"]
              }
            }
          }
        },
        activo: {
          bsonType: "bool",
          description: "Indica si la plantilla está vigente"
        },
        version: {
          bsonType: "int",
          description: "Versión de la plantilla"
        }
      }
    }
  },
  validationLevel: "moderate"
});

// indices plantillas_proceso (soporta versionado) y no permite que existan 2 tipos de procesos de mantenimiento a la vez
//es decir correctivo -> duke -> v1  
db.plantillas_proceso.createIndex(
  { tipo_maquina: 1, tipo_mantenimiento: 1, version: 1 },
  { unique: true }
);


/* =========================
   5) mantenimientos
   ========================= */
db.createCollection("mantenimientos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "maquina_id",
        "sucursal_id",
        "tipo_mantenimiento",
        "tipo_maquina",
        "estado",
        "fecha_solicitud",
        "creado_por",
        "cancelado",
        "pasos"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        maquina_id: {
          bsonType: "objectId",
          description: "Referencia a la máquina"
        },
        sucursal_id: {
          bsonType: "objectId",
          description: "Sucursal redundante para consultas"
        },
        tipo_mantenimiento: {
          bsonType: "string",
          enum: ["preventivo", "correctivo"]
        },
        tipo_maquina: {
          bsonType: "string",
          enum: ["duke", "taylor"]
        },
        estado: {
          bsonType: "string",
          enum: ["pendiente", "en_proceso", "finalizado", "cancelado"]
        },
        fecha_solicitud: {
          bsonType: "date"
        },
        fecha_inicio: {
          bsonType: ["date", "null"]
        },
        fecha_fin: {
          bsonType: ["date", "null"]
        },
        creado_por: {
          bsonType: "objectId"
        },
        asignado_a: {
          bsonType: ["objectId", "null"]
        },
        plantilla_id: {
          bsonType: ["objectId", "null"],
          description: "Referencia a la plantilla usada"
        },
        pasos: {
          bsonType: "array",
          minItems: 1,
          maxItems: 200,
          description: "Copia embebida de los pasos de la plantilla",
          items: {
            bsonType: "object",
            required: ["id", "orden", "nombre", "estado"],
            properties: {
              id: {
                bsonType: "int"
              },
              orden: {//-----------------------------------------orden especifico del paso 
                bsonType: "int"
              },
              nombre: {
                bsonType: "string"
              },
              estado: {
                bsonType: "string",
                enum: ["pendiente", "en_proceso", "completado", "bloqueado"]
              },
              completado_por: {
                bsonType: ["objectId", "null"]
              },
              completado_en: {
                bsonType: ["date", "null"]
              },
              evidencias_ids: {
                bsonType: ["array", "null"],
                items: {
                  bsonType: "objectId"
                },
                description: "Evidencias asociadas a este paso"
              },
              meta: {
                bsonType: ["object", "null"]
              }
            }
          }
        },
        // Campo global renombrado para evitar ambigüedad con el de pasos
        evidencias_globales_ids: {
          bsonType: ["array", "null"],
          items: {
            bsonType: "objectId"
          },
          description: "Evidencias generales del mantenimiento"
        },
        cancelado: {
          bsonType: "bool"
        },
        cancelado_por: {
          bsonType: ["objectId", "null"]
        },
        cancelado_en: {
          bsonType: ["date", "null"]
        },
        motivo_cancelacion: {
          bsonType: ["string", "null"]
        },
        created_at: {
          bsonType: ["date", "null"]
        },
        updated_at: {
          bsonType: ["date", "null"]
        }
      }
    }
  },
  validationLevel: "moderate"
});

// Índices mantenimientos
db.mantenimientos.createIndex(
  { maquina_id: 1, estado: 1, fecha_inicio: -1 }
);
db.mantenimientos.createIndex(
  { sucursal_id: 1, estado: 1 }
);


/* =========================
   6) evidencias
   ========================= */
db.createCollection("evidencias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "mantenimiento_id",
        "tipo",
        "url",
        "subido_por",
        "subido_en"
      ],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        mantenimiento_id: {
          bsonType: "objectId",
          description: "Referencia al mantenimiento"
        },
        paso_id: {
          bsonType: ["int", "null"],
          description: "Id de paso en la plantilla/mantenimiento (si aplica)"
        },
        tipo: {
          bsonType: "string",
          enum: ["foto", "pdf", "firma", "otro"],
          description: "Tipo general de evidencia"
        },
        subtipo: {
          bsonType: ["string", "null"],
          description: "Subtipo específico (opcional)"
        },
        url: {
          bsonType: "string",
          description: "URL en la nube"
        },
        nombre_archivo: {
          bsonType: ["string", "null"]
        },
        tamano_bytes: {
          bsonType: ["long", "int", "null"]
        },
        subido_por: {
          bsonType: "objectId"
        },
        subido_en: {
          bsonType: "date"
        },
        metadatos: {
          bsonType: ["object", "null"],
          description: "Campos extra (firma_nombre, hash, mime, etc.)"
        }
      }
    }
  },
  validationLevel: "moderate"
});

// Índices evidencias
db.evidencias.createIndex(
  { mantenimiento_id: 1, subido_en: -1 }
);




//keys mongo, google y correos 
//generente, tecnico, jefe de tecnicos
