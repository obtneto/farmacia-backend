import { Connection,RowDataPacket } from "mysql2/promise";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iRequisicoesFields {
    req_id : number,
    req_pac_id : number | null,
    req_date : Date |  null,
    req_med_id : number | null,
    req_qtde : number | null,
    req_lote: string | null,
    req_validade: Date | null,
    req_dep_id: number | null,
    req_local_id: number | null,
    req_aprova: 0 | 1 | null,
    reg_dt_aprovacao: Date | null,
    reg_dt_solicitacao: Date | null,
    req_solicitado_por: string | null,
    req_aprovado_por: string | null,
    req_tipo: string | null
}

export default class Requisicoes extends BaseModel implements iRequisicoesFields, iBaseModel {
    
    constructor(connection : Connection) {
        
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }
        
        const initFields : iRequisicoesFields = {
            req_id: 0,
            req_pac_id: null,
            req_date: null,
            req_med_id: null,
            req_qtde: null,
            req_lote: null,
            req_validade: null,
            req_dep_id: null,
            req_local_id: null,
            reg_dt_aprovacao: null,
            reg_dt_solicitacao: null,
            req_aprova: null,
            req_solicitado_por: null,
            req_aprovado_por: null,
            req_tipo: null
        };
        
        super(connection,'tb_requisicoes',initFields,'req_id');
    }

    get found(): boolean {return this._found;}

    set req_id(id: number) { this._fields.req_id = id;}
    get req_id(): number {return this._fields.req_id;}

    set req_pac_id(pac_id: number | null) { this._fields.req_pac_id = pac_id;}
    get req_pac_id(): number | null {return this._fields.req_pac_id;}

    set req_date(date: Date | null) { this._fields.req_date = date;}
    get req_date(): Date | null {return this._fields.req_date;}

    set req_med_id(med_id: number | null) { this._fields.req_med_id = med_id;}
    get req_med_id(): number | null {return this._fields.req_med_id;}

    set req_qtde(qtde: number | null) { this._fields.req_qtde = qtde;}
    get req_qtde(): number | null {return this._fields.req_qtde;}

    set req_lote(lote: string | null) { this._fields.req_lote = lote;}
    get req_lote(): string | null {return this._fields.req_lote;}

    set req_validade(validade: Date | null) { this._fields.req_validade = validade;}
    get req_validade(): Date | null {return this._fields.req_validade;}

    set req_dep_id(dep_id: number | null) { this._fields.req_dep_id = dep_id;}
    get req_dep_id(): number | null {return this._fields.req_dep_id;}

    set req_local_id(local_id: number | null) { this._fields.req_local_id = local_id;}
    get req_local_id(): number | null {return this._fields.req_local_id;}

    set req_aprova(aprova: 0 | 1 | null) { this._fields.req_aprova = aprova;}
    get req_aprova(): 0 | 1 | null {return this._fields.req_aprova;}

    set req_tipo(tipo: string | null) { this._fields.req_tipo = tipo;}
    get req_tipo(): string | null {return this._fields.req_tipo;}

    set req_solicitado_por(solicitado_por: string | null) { this._fields.req_solicitado_por = solicitado_por;}
    get req_solicitado_por(): string | null {return this._fields.req_solicitado_por;}

    set req_aprovado_por(aprovado_por: string | null) { this._fields.req_aprovado_por = aprovado_por;}
    get req_aprovado_por(): string | null {return this._fields.req_aprovado_por;}

    set reg_dt_aprovacao(dt_aprovacao: Date | null) { this._fields.reg_dt_aprovacao = dt_aprovacao;}
    get reg_dt_aprovacao(): Date | null {return this._fields.reg_dt_aprovacao;}

    set reg_dt_solicitacao(dt_solicitacao: Date | null) { this._fields.reg_dt_solicitacao = dt_solicitacao;}
    get reg_dt_solicitacao(): Date | null {return this._fields.reg_dt_solicitacao;}

    public async ListarPorPeriodo(dat_ini: Date, dat_fim: Date, aprova: 0 | 1 = 0) : Promise<iRequisicoesFields[]>{

        const query: string = `SELECT r.req_id as ID,r.req_date as data,p.nom_paciente as paciente, m.med_descr as medicamento, m.med_und as unidade, 
                             r.req_lote as lote,r.req_qtde as quantidade
                             FROM tb_requisicoes r
                             LEFT JOIN fsph_ambulatorio.tb_pacientes p ON r.req_pac_id = p.num_paciente
                             LEFT JOIN tb_medicamentos m ON r.req_med_id = m.med_id
                             WHERE r.req_date >= :dat_ini AND r.req_date <= :dat_fim AND r.req_aprova = :aprova`;

        const [rows] = await this.ExecuteQuery(query, {dat_ini, dat_fim, aprova}) as RowDataPacket[];

        return rows as iRequisicoesFields[];

    }
    
}