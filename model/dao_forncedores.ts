import { Connection,RowDataPacket} from 'mysql2/promise';
import BaseModel, { iBaseModel } from './BaseModel.js';

enum eAtivo {
    Inativo = 0,
    Ativo = 1,
}

export interface iFornecedoresFields {
    for_id : number,
    for_razao_social : string,
    for_nome_fantasia :string,
    for_cnpj : string,
    for_logradouro : string,
    for_numero: string,
    for_bairro: string,
    for_cidade: string,
    for_uf: string,
    for_cep: string,
    for_telefone: string,
    for_email: string,
    for_ativo: eAtivo,
}

export default class Fornecedores extends BaseModel implements iBaseModel,iFornecedoresFields {
    
    constructor(connection : Connection) {
    
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initFields: iFornecedoresFields = {
            for_id: 0,
            for_razao_social: '',
            for_nome_fantasia: '',
            for_cnpj: '',
            for_logradouro: '',
            for_numero: '',
            for_bairro: '',
            for_cidade: '',
            for_uf: '',
            for_cep: '',
            for_telefone: '',
            for_email: '',
            for_ativo: eAtivo.Inativo,
        };

        super(connection, 'tb_fornecedores', initFields, 'for_id');

    }

    get found(): boolean {return this._found;}

    set for_id(id : number) { this._fields.for_id = id;}
    get for_id() :number {return this._fields.for_id;}

    set for_razao_social(razao_social : string) { this._fields.for_razao_social = razao_social;}
    get for_razao_social() :string {return this._fields.for_razao_social;}

    set for_ativo(ativo : eAtivo) { this._fields.for_ativo = ativo;}
    get for_ativo() : eAtivo {return this._fields.for_ativo;}

    set for_nome_fantasia(nome_fantasia : string) { this._fields.for_nome_fantasia = nome_fantasia;}
    get for_nome_fantasia() :string {return this._fields.for_nome_fantasia;}

    set for_cnpj(cnpj : string) { this._fields.for_cnpj = cnpj;}
    get for_cnpj() :string {return this._fields.for_cnpj;}

    set for_logradouro(logradouro : string) { this._fields.for_logradouro = logradouro;}
    get for_logradouro() :string {return this._fields.for_logradouro;}

    set for_numero(numero : string) { this._fields.for_numero = numero;}
    get for_numero() :string {return this._fields.for_numero;}

    set for_bairro(bairro : string) { this._fields.for_bairro = bairro;}
    get for_bairro() :string {return this._fields.for_bairro;}

    set for_cidade(cidade : string) { this._fields.for_cidade = cidade;}
    get for_cidade() :string {return this._fields.for_cidade;}

    set for_uf(uf : string) { this._fields.for_uf = uf;}
    get for_uf() :string {return this._fields.for_uf;}

    set for_cep(cep : string) { this._fields.for_cep = cep;}
    get for_cep() :string {return this._fields.for_cep;}

    set for_telefone(telefone : string) { this._fields.for_telefone = telefone;}
    get for_telefone() :string {return this._fields.for_telefone;}

    set for_email(email : string) { this._fields.for_email = email;}
    get for_email() :string {return this._fields.for_email;}

    public async Listar(pesq : string = '') : Promise<iFornecedoresFields[]>{

        let query : string = "SELECT * FROM tb_fornecedores";

        if (pesq !== '*') {
            query += " WHERE for_razao_social LIKE :pesq OR for_nome_fantasia LIKE :pesq";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as [iFornecedoresFields[]];

        return rows;

    }

    public async ListarAtivos(pesq : string = '') : Promise<RowDataPacket[]>{

        let query : string = "SELECT for_id, for_razao_social, for_nome_fantasia FROM tb_fornecedores";

        if (pesq !== '*') {
            query += " WHERE (for_razao_social LIKE :pesq OR for_nome_fantasia LIKE :pesq ) AND for_ativo = 1";
        }

        const [rows] = await this.ExecuteQuery(query, {pesq: `%${pesq}%`}) as [RowDataPacket[]];

        return rows;

    }

}
