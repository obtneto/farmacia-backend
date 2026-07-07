import { Connection,RowDataPacket } from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

export interface iSolicitacoesFields {
   sol_id : number |null,
   sol_date : Date| string | null,
   sol_dep_id : number | null,
   sol_local_id : number | null,
   sol_user : string | null,
   sol_status : number | null,
   sol_obs : string | null,
}

export default class Solicitacoes extends BaseModel implements iBaseModel,iSolicitacoesFields {
    
    constructor(connection : Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iSolicitacoesFields = {
            sol_id: 0,
            sol_date: null,
            sol_dep_id: null,
            sol_local_id: null,
            sol_user: null,
            sol_status: null,
            sol_obs: null,
        };

        super(connection, 'tb_solicitacoes', initFields, 'sol_id');

    }

    get found(): boolean {return this._found;}

    set sol_id(id : number) { this._fields.sol_id = id;}
    get sol_id() :number {return this._fields.sol_id;}

    set sol_date(date : Date | string | null) { this._fields.sol_date = date;}
    get sol_date() :Date | string | null {return this._fields.sol_date;}

    set sol_dep_id(dep_id : number | null) { this._fields.sol_dep_id = dep_id;}
    get sol_dep_id() :number | null {return this._fields.sol_dep_id;}

    set sol_local_id(local_id : number | null) { this._fields.sol_local_id = local_id;}
    get sol_local_id() :number | null {return this._fields.sol_local_id;}

    set sol_user(user : string | null) { this._fields.sol_user = user;}
    get sol_user() :string | null {return this._fields.sol_user;}

    set sol_status(status : number | null) { this._fields.sol_status = status;}
    get sol_status() :number | null {return this._fields.sol_status;}

    set sol_obs(obs : string | null) { this._fields.sol_obs = obs;}
    get sol_obs() :string | null {return this._fields.sol_obs;}

    public async ListarAbertas(pesq : string = '') : Promise<RowDataPacket[]>{

      const query : string = `SELECT s.*, d.dep_nome, l.local_nome FROM tb_solicitacoes s
                              LEFT JOIN tb_depositos d ON s.sol_dep_id = d.dep_id
                              LEFT JOIN tb_locais l ON s.sol_local_id = l.local_id
                              WHERE s.sol_status = 0`;

      const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as [RowDataPacket[]];

      return rows;

    }

    public async ListarEncerradas(pesq : string = '',data_ini: string = '',data_fim: string = '') : Promise<RowDataPacket[]>{

      const query : string = `SELECT s.*, d.dep_nome, l.local_nome FROM tb_solicitacoes s
                              LEFT JOIN tb_depositos d ON s.sol_dep_id = d.dep_id
                              LEFT JOIN tb_locais l ON s.sol_local_id = l.local_id
                              WHERE s.sol_status = 1 AND s.sol_date >= :data_ini AND s.sol_date <= :data_fim`;

      const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`, data_ini, data_fim}) as [RowDataPacket[]];

      return rows;

    }

}
