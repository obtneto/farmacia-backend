import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel, {iBaseModel} from "./BaseModel.js";

export interface iEstoqueFields {
    est_id: number,
    est_dep_id: number | null,
    est_med_id: number | null,
    est_lote: string | null,
    est_saldo_disponivel: number | null,
    est_saldo_bloqueado: number | null,
    est_validade: Date | string | null
}

export default class Estoque extends BaseModel implements iEstoqueFields, iBaseModel {

    private connection: Connection;

    constructor(connection: Connection) {
     
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }
        
        const initFields: iEstoqueFields = {
            est_id: 0,
            est_dep_id: null,
            est_med_id: null,
            est_lote: null,
            est_saldo_disponivel: null,
            est_saldo_bloqueado: null,
            est_validade: null,
        };
        
        super(connection, 'tb_estoque', initFields, 'est_id');

        this.connection = connection;
    }

    get found(): boolean {return this._found;}

    set est_id(id: number) { this._fields.est_id = id;}
    get est_id(): number {return this._fields.est_id;}

    set est_dep_id(dep_id: number | null) { this._fields.est_dep_id = dep_id;}
    get est_dep_id(): number | null {return this._fields.est_dep_id;}

    set est_med_id(med_id: number | null) { this._fields.est_med_id = med_id;}
    get est_med_id(): number | null {return this._fields.est_med_id;}

    set est_lote(lote: string | null) { this._fields.est_lote = lote;}
    get est_lote(): string | null {return this._fields.est_lote;}

    set est_saldo_disponivel(saldo_disponivel: number | null) { this._fields.est_saldo_disponivel = saldo_disponivel;}
    get est_saldo_disponivel(): number | null {return this._fields.est_saldo_disponivel;}

    set est_saldo_bloqueado(saldo_bloqueado: number | null) { this._fields.est_saldo_bloqueado = saldo_bloqueado;}
    get est_saldo_bloqueado(): number | null {return this._fields.est_saldo_bloqueado;}

    set est_validade(validade: Date | string | null) { this._fields.est_validade = validade;}
    get est_validade(): Date | string | null{return this._fields.est_validade;}
    
    async ListarAtivos(pesq: string = '',dep_id: number,med_tipo_codigo: string) : Promise<iEstoqueFields[]>{

        let query: string = `SELECT 
                             m.med_id as id, 
                             m.med_descr as descricao, 
                             m.med_desc_coml as descricao_comercial,
                             m.und as unidade, 
                             e.est_lote as lote,
                             e.est_saldo_bloqueado as saldo_bloqueado, 
                             e.est_saldo_disponivel as saldo_disponivel, 
                             e.est_validade as validade 
                             FROM tb_estoque e
                             LEFT JOIN tb_medicamentos m ON e.est_med_id = m.med_id
                                WHERE 
                                e.est_dep_id = :dep_id AND 
                                m.med_tipo_codigo = :med_tipo_codigo AND
                                e.est_saldo_disponivel > 0`;

        if (pesq !== '*') {
            query += " AND m.med_descr LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`, dep_id, med_tipo_codigo});

        return rows as iEstoqueFields[];

    }

    async BuscarPorItemEstoque( dep_id: number, med_id: number, lote: string) : Promise<iEstoqueFields>{

        const query: string = `SELECT * FROM tb_estoque WHERE est_dep_id = :dep_id AND est_med_id = :med_id AND est_lote = :lote`;

        const [rows] = await this.connection.query(query, {dep_id,med_id,lote}) as RowDataPacket[]  ;

        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
            this.populateFromInitial({
                est_id: 0,
                est_dep_id: null,
                est_med_id: null,
                est_lote: null,
                est_saldo_disponivel: null,
                est_saldo_bloqueado: null,
                est_validade: null
            });
        }

        return this._fields;
    }
}
