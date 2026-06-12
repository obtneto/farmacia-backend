import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel, { iBaseModel } from "./BaseModel.js";

export interface iEntradaFields {
    ent_id: number;
    ent_dep_id: number | null,
    ent_date: Date | string | null;
    ent_doc: string | null;
    ent_for_id: number | null;
    ent_status: number | null
}

export default class Entradas extends BaseModel implements iEntradaFields, iBaseModel {

    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iEntradaFields = {
            ent_id: 0,
            ent_date: null,
            ent_doc: null,
            ent_for_id: null,
            ent_dep_id: null,
            ent_status: null
        };

        super(connection, 'tb_entradas', initialFields, 'ent_id');
    }

    get found(): boolean { return this._found; }

    set ent_id(ent_id: number) { this._fields.ent_id = ent_id; }
    get ent_id(): number { return this._fields.ent_id; }

    set ent_dep_id(dep_id :number | null) {this._fields.ent_dep_id = dep_id}
    get ent_dep_id() :number | null {return this._fields.ent_dep_id}

    set ent_date(ent_date: Date | string | null) { this._fields.ent_date = ent_date; }
    get ent_date(): Date | string | null { return this._fields.ent_date; }

    set ent_doc(ent_doc: string | null) { this._fields.ent_doc = ent_doc; }
    get ent_doc(): string | null { return this._fields.ent_doc; }

    set ent_for_id(ent_for_id: number | null) { this._fields.ent_for_id = ent_for_id; }
    get ent_for_id(): number | null { return this._fields.ent_for_id; }

    set ent_status(ent_status: number | null) {this._fields.ent_status = ent_status}
    get ent_status(): number | null {return this._fields.ent_status}

    async ListarPeriodo(pesq: string, data_inicio: Date, data_fim: Date,dep_id:number): Promise<RowDataPacket[]> {

        let query = `SELECT
                        e.ent_id AS id,
                        e.ent_date AS data,
                        e.ent_doc AS documento,
                        f.for_razao_social AS fornecedor
                     FROM tb_entradas e
                     LEFT JOIN tb_fornecedores f ON f.for_id = e.ent_for_id
                     WHERE e.ent_dep_id = :dep_id AND (e.ent_date >= :data_inicio
                       AND e.ent_date <= :data_fim) AND e.ent_status = 1`;

        if (pesq !== '*') {
            query += ` AND (
                e.ent_doc LIKE :pesq
                OR f.for_razao_social LIKE :pesq
                OR e.ent_doc LIKE :pesq
            )`;
        }

        query += `
            ORDER BY e.ent_id DESC`;

        const [rows] = await this.ExecuteQuery(query, {
            pesq: `%${pesq}%`,
            data_inicio,
            data_fim,
            dep_id
        });

        return rows as RowDataPacket[];
    }

    async ListarEntradasNaoAprovados(pesq: string, data_inicio: Date, data_fim: Date,dep_id:number): Promise<RowDataPacket[]> {

        let query = `SELECT
                        e.ent_id AS id,
                        e.ent_date AS data,
                        e.ent_doc AS documento,
                        f.for_razao_social AS fornecedor,
                        e.ent_status AS status
                     FROM tb_entradas e
                     LEFT JOIN tb_fornecedores f ON f.for_id = e.ent_for_id
                     WHERE e.ent_status = 0 AND e.ent_dep_id = :dep_id AND (e.ent_date >= :data_inicio
                       AND e.ent_date <= :data_fim) AND e.ent_status = 0`;

            if (pesq !== '*') {
                query += ` AND (
                    e.ent_doc LIKE :pesq
                    OR f.for_razao_social LIKE :pesq
                    OR e.ent_doc LIKE :pesq
            )`};           

        const [rows] = await this.ExecuteQuery(query, {
            pesq: `%${pesq}%`,
            data_inicio,
            data_fim,
            dep_id
        });

        return rows as RowDataPacket[];

    }

}
