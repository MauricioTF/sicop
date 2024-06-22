//exportamos nuestra interfaz
export interface Incidencia{
    uid: string,
    cn_id_usuario: number,
    cn_id_estado: number,
    cn_id_afectacion: number,
    cn_id_riesgo: string,
    cn_id_prioridad: number,
    cn_id_categoria: string,
    ct_id_img: string,
    ct_titulo: string,
    cf_fecha_hora: Date
    ct_descripcion: string,
    ct_lugar: string,
    ct_justificacion_cierre: string,
    cn_monto: number,
    cn_tiempo_estimado: number,
    cn_tecnicos : number,
}