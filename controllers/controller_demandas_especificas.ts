import Database, { iDatabase } from '../connections/dbconn.js';
import DemandasEspecificas, {iDemandasEspecificasFields}  from '../model/dao_demanda_especificas.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";
import { RowDataPacket } from 'mysql2';

export default class Controller_DemandasEspecificas {

    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []

        };

        try {

            void await db.Connect();

            const demanda_id : number = Number(req.params.id_demanda || 0);

            if (demanda_id === 0) {
                const error = new Error('ID Demanda Específica não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            
            const dados = await demandasEspecificas.BuscarPorId(demanda_id) as RowDataPacket;

            if (!demandasEspecificas.found) {
                const error = new Error('Demanda Específica não encontrada');
                error.statusCode = 404;
                throw error;
            }

            const result = await demandasEspecificas.BuscarPorPaciente(dados.dem_pac_id) as RowDataPacket

            dados.nome_paciente = result.nome_paciente;
            dados.data_nascimento = result.data_nascimento;
            
            resdata.data = dados;
            

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarDemandas();

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async ListarDemandasAtivos(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarDemandasAtivos();

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async BuscarPorPaciente(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const pac_id : number = Number(req.params.pac_id || 0);

            if (pac_id === 0) {
                const error = new Error('ID Paciente não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.BuscarPorPaciente(pac_id) as iDemandasEspecificasFields[];

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Salvar(req: Request, res: Response) {  //rever esse metodo....

         const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demandaData = req.body as iDemandasEspecificasFields; //tirar isso ...

            const demandasEspecificas = new DemandasEspecificas(db.connection);

            if (demandaData.dem_pac_id === 0 || demandaData.dem_pac_id === undefined) {
                const error = new Error('ID do paciente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (demandaData.dem_medico_assis === '' || demandaData.dem_medico_assis === undefined) {
                const error = new Error('Nome do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

             if (demandaData.dem_medico_crm === '' || demandaData.dem_medico_crm === undefined) {
                const error = new Error('CRM do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (demandaData.dem_ativo === undefined) {
                const error = new Error('Status ativo da demanda não informado');
                error.statusCode = 400;
                throw error;
            }

            await demandasEspecificas.BuscarPorId(demandaData.dem_id);

            demandasEspecificas.dem_pac_id = demandaData.dem_pac_id;
            demandasEspecificas.dem_medico_assis = demandaData.dem_medico_assis;
            demandasEspecificas.dem_medico_crm = demandaData.dem_medico_crm;
            demandasEspecificas.dem_ativo = demandaData.dem_ativo;

            await demandasEspecificas.Salvar();

            resdata.data = { id: demandasEspecificas.dem_id };

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }
    
    static async Excluir(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const demanda_id : number = Number(req.params.id_demanda || 0);

            if (demanda_id === 0) {
                const error = new Error('ID Demanda Específica não informado');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            await demandasEspecificas.Excluir(demanda_id);

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }   

}