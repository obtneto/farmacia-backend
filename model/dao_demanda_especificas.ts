import { Connection, RowDataPacket } from "mysql2/promise";
import BaseModel,{iBaseModel} from "./BaseModel.js";

export interface iDemandasEspecificasFields {
    dem_id : number,
    dem_pac_id : number | null,
    dem_medico_assis : string | null,
    dem_medico_crm : string | null,
    dem_med_id : number | null,    
    dem_qtde_medicamento: number | null,
    dem_qtde_doses: number | null,
    dem_ativo : 0 | 1 | null,
}

export default class DemandasEspecificas extends BaseModel implements iBaseModel,iDemandasEspecificasFields {
    
    private connection: Connection;
    
    constructor(connection: Connection) {

        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        const initialFields: iDemandasEspecificasFields = {
            dem_id: 0,
            dem_pac_id: null,
            dem_medico_assis: null,
            dem_medico_crm: null,
            dem_med_id: null,
            dem_qtde_medicamento: null,
            dem_qtde_doses: null,
            dem_ativo: null,
        }
        
        super(connection, 'tb_demandas_especificas', initialFields, 'dem_id');

        this.connection = connection;
    }

    get found() {return this._found;}

    set dem_id(id: number) {this._fields.dem_id = id;}
    get dem_id():number {return this._fields.dem_id;}
    
    set dem_pac_id(pac_id: number | null) {this._fields.dem_pac_id = pac_id;}
    get dem_pac_id(): number | null {return this._fields.dem_pac_id;}
    
    set dem_medico_assis(medico_assis: string | null) {this._fields.dem_medico_assis = medico_assis;}
    get dem_medico_assis() :string | null {return this._fields.dem_medico_assis;}
    
    set dem_medico_crm(medico_crm: string | null) {this._fields.dem_medico_crm = medico_crm;}
    get dem_medico_crm(): string | null {return this._fields.dem_medico_crm;}
    
    set dem_med_id(med_id: number | null) {this._fields.dem_med_id = med_id;}
    get dem_med_id(): number | null {return this._fields.dem_med_id;}
    
    set dem_qtde_medicamento(qtde_medicamento: number | null) {this._fields.dem_qtde_medicamento = qtde_medicamento;}
    get dem_qtde_medicamento(): number | null {return this._fields.dem_qtde_medicamento;}

    set dem_qtde_doses(qtde_doses: number | null) {this._fields.dem_qtde_doses = qtde_doses;}
    get dem_qtde_doses(): number | null {return this._fields.dem_qtde_doses;}
    
    set dem_ativo(ativo: 0 | 1 | null) {this._fields.dem_ativo = ativo;}
    get dem_ativo(): 0 | 1 | null {return this._fields.dem_ativo;}
    
    async ListarDemandas() {

        const query = `SELECT d.dem_id as id, d.dem_pac_id as num_pacientes, p.nom_paciente as nome_paciente, p.dt_nascimento as data_nascimento,
                       d.dem_medico_assis as medico_assistente, d.dem_medico_crm as medico_crm, m.med_descr as medicamento, 
                       d.dem_qtde_medicamento as qtde_medicamento, d.dem_qtde_doses as qtde_doses, d.dem_ativo as ativo 
                       FROM tb_demandas_especificas d 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON d.dem_pac_id = p.num_paciente
                       LEFT JOIN tb_medicamentos m ON d.dem_med_id = m.med_id`;
        
        const [rows] = await this.connection.query(query) as RowDataPacket[];
        return rows;
    }

    async ListarDemandasAtivos() {

        const query = `SELECT d.dem_id as id, p.nom_paciente as nome_paciente
                       FROM tb_demandas_especificas d 
                       LEFT JOIN fsph_ambulatorio.tb_pacientes p ON d.dem_pac_id = p.num_paciente
                       WHERE d.dem_ativo = 1`;
        
        const [rows] = await this.connection.query(query) as RowDataPacket[];
        return rows;
    }

    async BuscarPorPaciente(pac_id: number) {

        const query = `SELECT * FROM tb_demandas_especificas WHERE dem_pac_id = :pac_id`;
        
        const [rows] = await this.connection.query(query, { pac_id })  as RowDataPacket[];
        
        if (rows && rows.length > 0) {
            this.populateFromRow(rows[0]);
            this._found = true;
        } else {
            this._found = false;
        }

        return this._fields;
    }
}
