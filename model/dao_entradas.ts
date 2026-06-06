import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel, { iBaseModel } from "./BaseModel.js";

export interface iEntradaFields {
    ent_id: number;
    ent_date: Date | string;
    ent_doc: string;
    ent_fornecido_por: string;
}

export interface iEntradaListItem {
    id: number;
    data: Date | string;
    documento: string;
    fornecedor: string;
    medicamentos: string;
    total_itens: number;
    quantidade_total: number;
}

export default class Entradas extends BaseModel implements iEntradaFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iEntradaFields = {
            ent_id: 0,
            ent_date: new Date(),
            ent_doc: '',
            ent_fornecido_por: ''
        };

        super(connection, 'tb_entradas', initialFields, 'ent_id');
    }

    get found(): boolean { return this._found; }

    set ent_id(ent_id: number) { this._fields.ent_id = ent_id; }
    get ent_id(): number { return this._fields.ent_id; }

    set ent_date(ent_date: Date | string) { this._fields.ent_date = ent_date; }
    get ent_date(): Date | string { return this._fields.ent_date; }

    set ent_doc(ent_doc: string) { this._fields.ent_doc = ent_doc; }
    get ent_doc(): string { return this._fields.ent_doc; }

    set ent_fornecido_por(ent_fornecido_por: string) { this._fields.ent_fornecido_por = ent_fornecido_por; }
    get ent_fornecido_por(): string { return this._fields.ent_fornecido_por; }

    async ListarTodos(pesq: string, data_inicio: Date, data_fim: Date): Promise<iEntradaListItem[]> {

        let query = `SELECT
                        e.ent_id AS id,
                        e.ent_date AS data,
                        e.ent_doc AS documento,
                        e.ent_fornecido_por AS fornecedor,
                        COALESCE(GROUP_CONCAT(DISTINCT m.med_descr ORDER BY m.med_descr SEPARATOR ' | '), '') AS medicamentos,
                        COUNT(i.ite_ent_med_id) AS total_itens,
                        COALESCE(SUM(i.ite_ent_qtde), 0) AS quantidade_total
                     FROM tb_entradas e
                     LEFT JOIN tb_itens_entradas i ON i.ite_ent_id = e.ent_id
                     LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
                     WHERE e.ent_date >= :data_inicio
                       AND e.ent_date <= :data_fim`;

        if (pesq !== '*') {
            query += ` AND (
                e.ent_doc LIKE :pesq
                OR e.ent_fornecido_por LIKE :pesq
                OR m.med_descr LIKE :pesq
            )`;
        }

        query += `
            GROUP BY e.ent_id, e.ent_date, e.ent_doc, e.ent_fornecido_por
            ORDER BY e.ent_id DESC`;

        const [rows] = await this.ExecuteQuery(query, {
            pesq: `%${pesq}%`,
            data_inicio,
            data_fim
        });

        return rows as iEntradaListItem[];
    }

    async BuscarUltimaEntrada(): Promise<iEntradaFields | null> {
        const query = `SELECT ent_id, ent_date, ent_doc, ent_fornecido_por
                       FROM tb_entradas
                       ORDER BY ent_id DESC
                       LIMIT 1`;

        const [rows] = await this.ExecuteQuery(query) as RowDataPacket[];

        if (!rows || rows.length === 0) {
            return null;
        }

        this.populateFromRow(rows[0]);
        this._found = true;

        return this._fields as iEntradaFields;
    }
}
