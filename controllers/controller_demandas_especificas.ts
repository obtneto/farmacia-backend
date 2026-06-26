import Database, { iDatabase } from '../connections/dbconn.js';
import DemandasEspecificas from '../model/dao_demanda_especificas.js';
import ItensDemandasEspecificas from '../model/dao_itens_demandas_especificas.js';
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

            resdata.data = await demandasEspecificas.BuscarPorPaciente(pac_id) as RowDataPacket[];

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
    
    static async Salvar(req: Request, res: Response) {  // repensar esse controller

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const dem_id: number = Number(req.body?.id || 0);
            const dem_pac_id: number = Number(req.body.dem_pac_id || 0 );
            const dem_medico_assis: string | null = String(req.body.dem_medico_assit || null);
            const dem_medico_crm: string | null = String(req.body.dem_medico_crm || null);
            const dem_responsavel: string | null = String(req.body.dem_responsavel || null);
            const dem_diag_id: number = Number(req.body.dem_diag_id || 0);

            const itens = Array.isArray(req.body.itens) ? req.body.itens : null

            if (dem_pac_id === 0) {
                const error = new Error('ID do paciente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!dem_medico_assis) {
                const error = new Error('Nome do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (!dem_medico_crm) {
                const error = new Error('CRM do médico assistente não informado');
                error.statusCode = 400;
                throw error;
            }

            if (dem_diag_id === 0) {
                const error = new Error('ID do Diagnostico obrigatorio.');
                error.statusCode = 400;
                throw error;
            }

            if (!itens || itens.length === 0) {
                const error = new Error('Adicione pelo menos um item à entrada.');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const itens_demandas = new ItensDemandasEspecificas(db.connection);

            await demandasEspecificas.BuscarPorId(dem_id);

            demandasEspecificas.dem_pac_id = dem_pac_id;
            demandasEspecificas.dem_medico_assis = dem_medico_assis.toUpperCase();
            demandasEspecificas.dem_medico_crm = dem_medico_crm;
            demandasEspecificas.dem_responsavel = dem_responsavel.toUpperCase();
            demandasEspecificas.dem_diag_id = dem_diag_id;

            await demandasEspecificas.Salvar();

            for (const item of itens) {

                const dem_med_id = Number(item.dem_med_id || 0);
                const dem_med_lote = String(item.dem_med_lote || '').toUpperCase();
                const dem_med_qtde = Number(item.dem_med_qtde || 0);

                if (dem_id === 0) {
                    const error = new Error('ID do medicamento obrigatorio.');
                    error.statusCode = 400;
                    throw error;
                }

                if (dem_med_lote === '') {
                     const error = new Error('Lote do medicamento obrigatorio.');
                    error.statusCode = 400;
                    throw error;
                }

                if (dem_med_qtde <= 0) {
                     const error = new Error('quantidade do medicamento deve ser maior que ZERO.');
                    error.statusCode = 400;
                    throw error;
                } 

                await itens_demandas.BuscarPorId(item.ite_id);

                itens_demandas.ite_dem_id = dem_id;
                itens_demandas.ite_dem_med_id = dem_med_id;
                itens_demandas.ite_dem_med_qtde = dem_med_qtde
                itens_demandas.ite_dem_med_ativo = itens_demandas.found ? itens_demandas.ite_dem_med_ativo : 1;

                await itens_demandas.Salvar()

            }

            await db.Commit();

            resdata.msg = "Dados Salvo com Sucesso."
           

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
    
    static async ListarItensDemandas(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();

            const dem_id: number = Number(req.params.dem_id || 0);

            if (dem_id === 0) {
                const error = new Error('ID invalido.');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarItensDemandas(dem_id)

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

}