export interface Diagnostico{
    uid: string,
    cn_id_diagnostico: number,
    cn_id_usuario: number,
    cf_fecha_hora: Date,
    ct_descripcion: string,
    cn_tiempo_estimado_solucion: number,
    ct_observaciones: string,
    cn_id_img: number
}