import {Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iDepositosFields {
    dep_id : number,
    dep_descr : string | null,
    dep_ativo : 0 | 1 | null
}

export default class Depositos extends BaseModel implements iDepositosFields, iBaseModel{

    constructor(connection : Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields : iDepositosFields = {
            dep_id: 0,
            dep_descr: null,
            dep_ativo: null,
        };

        super(connection,'tb_depositos',initFields,'dep_id');

    }

    get found(): boolean {return this._found;}

    set dep_id(id: number) { this._fields.dep_id = id;}
    get dep_id(): number {return this._fields.dep_id;}

    set dep_descr(descr: string | null) { this._fields.dep_descr = descr;}
    get dep_descr(): string | null {return this._fields.dep_descr;}

    set dep_ativo(ativo: 0 | 1 | null) { this._fields.dep_ativo = ativo;}
    get dep_ativo(): 0 | 1 | null {return this._fields.dep_ativo;}

    public async Listar(pesq: string) : Promise<iDepositosFields[]>{

        let query: string = "SELECT * FROM tb_depositos";

        if (pesq !== '*') {
            query += " WHERE dep_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as RowDataPacket[];

        return rows as iDepositosFields[];

    }

}

