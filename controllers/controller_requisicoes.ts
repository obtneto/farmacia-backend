import Database, {iDatabase} from "../connections/dbconn.js";
import { Request, Response } from "express";
import { applyControllerError } from "../utils/controllerError.js";
import { iresdata } from "./interface_controllers.js";
import Requisicoes from "../model/dao_requisicoes.js";
import DemandasEspecificas from "../model/dao_demanda_especificas.js";
import Estoque from "../model/dao_estoque.js";

// Coordena requisicoes e o fluxo de aprovacao com impacto em estoque.
export default class Controller_Requisicoes {

    static async Listar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const dat_ini = String(req.params.dat_ini);
            const dat_fim = String(req.params.dat_fim);
            const aprova = Number(req.params.aprova || 0) as 0 | 1;

            if (!dat_ini || !dat_fim) {
                const error = new Error('Datas não informadas') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);

            const result = await requisicoes.ListarPorPeriodo(new Date(dat_ini), new Date(dat_fim), aprova);
            
            resdata.data = result;
            
        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async Buscar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            const id = Number(req.params.req_id || 0);

            if (!id || id <= 0) {
                const error = new Error('ID não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            const requisicoes = new Requisicoes(db.connection);

            const result = await requisicoes.BuscarPorId(Number(id));

            if (!requisicoes.found) {
                const error = new Error('Requisição não encontrada') as any;
                error.statusCode = 404;
                throw error;
            }
            
            resdata.data = result;
            
        } catch (error :any) {

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async Salvar(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            void await db.Begin();

            const req_id = Number(req.body.req_id || 0);
            const req_data = new Date(req.body.req_data);
            const req_med_id = Number(req.body.req_med_id || 0);
            const req_pac_id = Number(req.body.req_pac_id || 0);
            const req_qtde = Number(req.body.req_qtde || 0);
            const req_lote = String(req.body.req_lote || null).trim().toLocaleUpperCase();
            const req_validade = new Date(req.body.req_validade || null);
            const req_dep_id = Number(req.body.req_dep_id || 0);
            const req_local_id = Number(req.body.req_local_id || 0);
            const req_tipo = String(req.body.req_tipo || null).trim().toLocaleUpperCase();
            const req_solicitado_por = String(req.body.req_solicitado_por || null).trim().toLocaleUpperCase();
            const req_dt_solicitacao = new Date();

            if (!req_id) {
                const error = new Error('Requisição não informada') as any;
                error.statusCode = 400;
                throw error;
            }

            if (isNaN(req_data.getTime())) {
                const error = new Error('Data não informada ou inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_med_id) {
                const error = new Error('Medicamento não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_pac_id) {
                const error = new Error('Paciente não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_qtde || req_qtde <= 0) {
                const error = new Error('Quantidade não informada') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_lote) {
                const error = new Error('Lote não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_validade || isNaN(req_validade.getTime())) {
                const error = new Error('Validade não informada ou inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_dep_id || req_dep_id <= 0) {
                const error = new Error('Departamento    não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_dep_id || req_dep_id <= 0) {
                const error = new Error('Departamento não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_local_id || req_local_id <= 0) {
                const error = new Error('Local não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!req_tipo) {
                const error = new Error('Tipo de requisição não informado') as any;
                error.statusCode = 400;
                throw error;
            }

            if (!req_solicitado_por) {
                const error = new Error('Solicitante não informado') as any;
                error.statusCode = 400;
                throw error;
            }
            
            const requisicoes = new Requisicoes(db.connection);

            requisicoes.req_date = req_data;
            requisicoes.req_pac_id = req_pac_id;
            requisicoes.req_qtde = req_qtde;
            requisicoes.req_lote = req_lote;
            requisicoes.req_validade = req_validade;
            requisicoes.req_dep_id = req_dep_id;
            requisicoes.req_local_id = req_local_id;
            requisicoes.req_tipo = req_tipo;
            requisicoes.req_solicitado_por = req_solicitado_por;
            requisicoes.reg_dt_solicitacao = req_dt_solicitacao;

            await requisicoes.Salvar();

            void await db.Commit();

            resdata.msg = 'Requisição salva com sucesso';
            
        } catch (error :any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }

    static async AprovarRequisicao(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: {}
        }

        try {

            void await db.Connect();

            void await db.Begin();

            const req_id = Number(req.params.req_id);
            const req_aprovado_por = req.params.req_aprovado_por ? String(req.params.req_aprovado_por) : null;
            
            // Validações de entrada
            if (!req_id || req_id <= 0) {
                const error = new Error('ID da requisição não informado ou inválido') as any;
                error.statusCode = 400;
                throw error;
            }
            
            if (!req_aprovado_por) {
                const error = new Error('Usuario de aprovação não informado.');
                error.statusCode = 400;
                throw error; 
            }
            
            // Instancia os DAOs necessários para o processo de aprovação, que impacta demandas específicas e estoque.
            const requisicoes = new Requisicoes(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const estoque = new Estoque(db.connection);

            // Buscar a requisição para obter os dados necessários para atualizar as demandas específicas e o estoque.
            const item = await requisicoes.BuscarPorId(req_id);

            if (!requisicoes.found) {
                const error = new Error("Numero da requisição não encontrada.");
                error.statusCode = 404;
                throw error;
            }

            requisicoes.req_aprova = 1;
            requisicoes.req_aprovado_por = req_aprovado_por.trim().toLocaleUpperCase();
            requisicoes.reg_dt_aprovacao = new Date();

            await requisicoes.Salvar();

            //Buscar pacientes com demandas específicas para atualizar as quantidades demandadas, caso existam. E atualizar o estoque.
            // await demandas.BuscarPorPaciente(item.req_pac_id);

            // if (demandas.found) {
                
            //     demandas.dem_qtde_medicamento -= item.req_qtde;
            //     demandas.dem_qtde_doses -= item.req_qtde;

            //     await demandas.Salvar();

            // }

            // Atualizar o estoque
            await estoque.BuscarPorItemEstoque(item.req_med_id,item.req_dep_id,item.req_lote);

            if (!estoque.found) {
                const error = new Error('Item de Estoque não encontrado.') as any;
                error.statusCode = 404;
                throw error;
            }

            if (estoque.est_saldo_disponivel < item.req_qtde) {
                const error = new Error('Saldo em estoque insuficiente.') as any;
                error.statusCode = 400;
                throw error;
            }

            estoque.est_saldo_disponivel -= item.req_qtde;

            await estoque.Salvar();
            
            await db.Commit();

            resdata.msg = 'Requisição aprovada com sucesso';
            
        } catch (error :any) {

            void await db.Rollback();

            applyControllerError(resdata, error, 'Controller Requisicoes');

        }

        void await db.Disconnect();

        return res.status(resdata.status).json(resdata);

    }
}
