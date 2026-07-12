import { Connection,RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iItensSolicitacoesFields {
    iso_id : number | null,
    iso_sol_id : number | null,
    iso_med_id : number | null,
    iso_med_qtde : number | null,
    iso_med_lote : string | null,
    iso_med_validade : Date | string | null,
}

export default class ItensSolicitacoes extends BaseModel implements iBaseModel,iItensSolicitacoesFields {
    
      constructor(connection : Connection) {
    
      if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
      }

      const initFields: iItensSolicitacoesFields = {
            iso_id: 0,
            iso_sol_id: null,
            iso_med_id: null,
            iso_med_qtde: null,
            iso_med_lote: null,
            iso_med_validade: null,
      };

      super(connection, 'tb_itens_solicitacoes', initFields, 'iso_id');

    }

    get found(): boolean {return this._found;}

    set iso_id(id : number) { this._fields.iso_id = id;}
    get iso_id() :number {return this._fields.iso_id;}

    set iso_sol_id(sol_id : number) { this._fields.iso_sol_id = sol_id;}
    get iso_sol_id() :number {return this._fields.iso_sol_id;}

    set iso_med_id(med_id : number | null) { this._fields.iso_med_id = med_id;}
    get iso_med_id() :number | null {return this._fields.iso_med_id;}

    set iso_med_qtde(qtde : number | null) { this._fields.iso_med_qtde = qtde;}
    get iso_med_qtde() :number | null {return this._fields.iso_med_qtde;}

    set iso_med_lote(lote : string | null) { this._fields.iso_med_lote = lote;}
    get iso_med_lote() :string | null {return this._fields.iso_med_lote;}

    set iso_med_validade(validade : Date | string | null) { this._fields.iso_med_validade = validade;}
    get iso_med_validade() :Date | string | null {return this._fields.iso_med_validade;}

    public async ListarItens(sol_id: number) : Promise<RowDataPacket[]> {

      const query : string = `SELECT i.*, m.med_descr, m.med_descr_coml FROM tb_itens_solicitacoes i
                              LEFT JOIN tb_medicamentos m ON i.iso_med_id = m.med_id 
                              WHERE iso_sol_id = :sol_id`;

      const [rows] = await this.ExecuteQuery(query, {sol_id: sol_id}) as [RowDataPacket[]];

      return rows;

    }

}
