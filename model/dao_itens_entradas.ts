import { Connection, RowDataPacket } from "mysql2/promise";
import baseModel,{iBaseModel} from "./BaseModel.js";

export interface iItemEntradaFields {
    ite_id: number;
    ite_ent_id: number | null;
    ite_ent_med_id: number | null;
    ite_ent_lote: string | null;
    ite_ent_lote_validade: Date | string | null;
    ite_ent_qtde: number | null;
}


export default class ItensEntradas extends baseModel implements iBaseModel,iItemEntradaFields {

    constructor(connection: Connection) {
        
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iItemEntradaFields = {
            ite_id: 0,
            ite_ent_id: null,
            ite_ent_med_id: null,
            ite_ent_lote: null,
            ite_ent_lote_validade: null,
            ite_ent_qtde: null      
        };
        
        super(connection, 'tb_itens_entradas', initialFields, 'ite_id');

    }

    get found() :boolean {return this._found}

    set ite_id(ite_id :number) {this._fields.ite_id = ite_id}
    get ite_id() :number {return this._fields.ite_id}

    set ite_ent_id(ite_ent_id: number | null) {this._fields.ite_ent_id = ite_ent_id }
    get ite_ent_id() :number | null {return this._fields.ite_ent_id}

    set ite_ent_med_id(ite_ent_med_id: number | null) {this._fields.ite_ent_med_id = ite_ent_med_id }
    get ite_ent_med_id() :number | null {return this._fields.ite_ent_med_id}

    set ite_ent_lote(ite_ent_lote: string | null) {this._fields.ite_ent_lote = ite_ent_lote }
    get ite_ent_lote() :string | null {return this._fields.ite_ent_lote}

    set ite_ent_lote_validade(ite_ent_lote_validade: Date | string | null) {this._fields.ite_ent_lote_validade = ite_ent_lote_validade }
    get ite_ent_lote_validade() :Date | string | null {return this._fields.ite_ent_lote_validade}

    set ite_ent_qtde(ite_ent_qtde: number | null) {this._fields.ite_ent_qtde = ite_ent_qtde }
    get ite_ent_qtde() :number | null {return this._fields.ite_ent_qtde}

    public async ListarItens(ent_id :number) : Promise<RowDataPacket[]> {

        const query: string = `SELECT 
                                    i.ite_id as id, 
                                    i.ite_ent_med_id as id_medicacao, 
                                    m.med_descr as medicacao,
                                    m.med_descr_coml as 'descricao comercial',
                                    i.ite_ent_lote as lote,
                                    i.ite_ent_lote_validade as validade,
                                    i.ite_ent_qtde as quantidade
                                FROM tb_itens_entradas i
                                LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
                                WHERE i.ite_ent_id = :ent_id`;

        const [rows] = await this.ExecuteQuery(query,{ent_id}) as RowDataPacket[]

        return rows as RowDataPacket[]

    }

}
