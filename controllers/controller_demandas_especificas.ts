import Database, { iDatabase } from '../connections/dbconn.js';
import DemandasEspecificas from '../model/dao_demanda_especificas.js';
import Entradas from "../model/dao_entradas.js";
import Estoque from "../model/dao_estoque.js";
import ItensEntradas from "../model/dao_itens_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import Movimentacoes from "../model/dao_movimentacoes.js";
import ItensDemandasEspecificas from '../model/dao_itens_demandas_especificas.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";
import { RowDataPacket } from 'mysql2';
import { it } from 'node:test';

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
            void await db.Begin();

            const dem_id: number = Number(req.body?.id || 0);
            const dem_pac_id: number = Number(req.body.dem_pac_id || 0 );
            const dem_medico_assis_raw = req.body.dem_medico_assis ?? req.body.dem_medico_assit ?? '';
            const dem_medico_assis: string = String(dem_medico_assis_raw || '').trim();
            const dem_medico_crm: string = String(req.body.dem_medico_crm || '').trim();
            const dem_responsavel: string = String(req.body.dem_responsavel || '').trim();
            const dem_diag_id: number = Number(req.body.dem_diag_id || 0);

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

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const itens_demandas = new ItensDemandasEspecificas(db.connection);

            await demandasEspecificas.BuscarPorId(dem_id);

            demandasEspecificas.dem_pac_id = dem_pac_id;
            demandasEspecificas.dem_medico_assis = dem_medico_assis.toUpperCase();
            demandasEspecificas.dem_medico_crm = dem_medico_crm;
            demandasEspecificas.dem_responsavel = dem_responsavel.toUpperCase();
            demandasEspecificas.dem_diag_id = dem_diag_id;

            await demandasEspecificas.Salvar();

            // const savedDemandaId = Number(demandasEspecificas.dem_id || 0);

            // for (const item of itens) {

            //     const dem_med_id = Number(item.dem_med_id || 0);
            //     const dem_med_qtde = Number(item.dem_med_qtde || 0);

            //     if (dem_med_id === 0) {
            //         const error = new Error('ID do medicamento obrigatorio.');
            //         error.statusCode = 400;
            //         throw error;
            //     }

            //     if (dem_med_qtde <= 0) {
            //          const error = new Error('quantidade do medicamento deve ser maior que ZERO.');
            //         error.statusCode = 400;
            //         throw error;
            //     } 

            //     await itens_demandas.BuscarPorId(item.ite_id);

            //     itens_demandas.ite_dem_id = savedDemandaId;
            //     itens_demandas.ite_dem_med_id = dem_med_id;
            //     itens_demandas.ite_dem_med_qtde = dem_med_qtde
            //     itens_demandas.ite_dem_med_ativo = itens_demandas.found ? itens_demandas.ite_dem_med_ativo : 1;

            //     await itens_demandas.Salvar()

            // }

            await db.Commit();

            resdata.msg = "Dados Salvo com Sucesso."
            resdata.data = {dem_id}
           

        } catch (error :any) {
            void await db.Rollback();
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

            const dem_pac_id: number = Number(req.params.dem_pac_id || 0);

            if (dem_pac_id === 0) {
                const error = new Error('ID Paciente invalido.');
                error.statusCode = 400;
                throw error;
            }

            const demandasEspecificas = new DemandasEspecificas(db.connection);
            const dados = await demandasEspecificas.ListarItensDemandas(dem_pac_id)

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async SalvarEntradas(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            void await db.Connect();
            void await db.Begin();

            // Validar os dados recebidos do corpo da requisição
            const ent_id = Number(req.body.ent_id || 0);
            let ent_doc = String(req.body.ent_doc || '');
            const ent_doc_informado = ent_doc.trim().length > 0;
            const ent_pac_id = Number(req.body.ent_pac_id || 0);
            const ent_for_id: number = Number(req.body.ent_for_id || 0);
            const ent_dep_id = Number(req.body.ent_dep_id || 0);
            const ent_user_digit = String(req.body.ent_user_digit || null);
            const itens = Array.isArray(req.body.itens) ? req.body.itens : null

            // Validar os dados recebidos do corpo da requisição
            if (ent_pac_id === 0) {
                const error = new Error('Paciente não Informado.');
                error.statusCode = 400;
                throw error;
            }

            if(ent_for_id <= 0) {
                const error = new Error('Fornecedor não informado.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_dep_id <= 0) {
                const error = new Error('Depósito de destino é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_user_digit === null || ent_user_digit.trim().length === 0) {
                const error = new Error('Usuário digitador é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (!itens || itens.length === 0) {
                const error = new Error('Adicione pelo menos um item à entrada.');
                error.statusCode = 400;
                throw error;
            }

            // Gerar um número de documento automático se não for fornecido
            if (!ent_doc) {

                const anoAtual = new Date().getFullYear();
                const mesAtual = (new Date().getMonth() + 1).toString().padStart(2,'0');
                const numeroAleatorio = Math.floor(Math.random() * 11333).toString().padStart(4, '0');
                
                ent_doc = `${anoAtual}-${mesAtual}-${numeroAleatorio}`;
            }

            // Instanciar os DAOs necessários para salvar a entrada e os itens
            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);
            const demandas = new DemandasEspecificas(db.connection);
            const itensDemandas = new ItensDemandasEspecificas(db.connection);
        
            // Buscar a entrada existente ou criar uma nova
            void await entradas.BuscarPorId(ent_id);

            entradas.ent_date = new Date();
            entradas.ent_doc = ent_doc;
            entradas.ent_dep_id = ent_dep_id;
            entradas.ent_pac_id = ent_pac_id;
            entradas.ent_for_id = ent_for_id;
            entradas.ent_status = 0;
            entradas.ent_user_digit = ent_user_digit;
            entradas.ent_dt_digit = new Date();

            await entradas.Salvar();

            // Salvar os itens da entrada e atualizar os itens das demandas específicas
            for (const item of itens) {

                // Validar os dados do item
                const itemMedId = Number(item.ent_med_id || 0);
                const itemLote = String(item.ent_lote || '');
                const itemLoteValidade = item.ent_lote_validade;
                const itemQtde = Number(item.ent_qtde || 0);

                if (itemMedId === 0) {
                    const error = new Error('ID do medicamento obrigatorio.');
                    error.statusCode = 400;
                    throw error;
                }

                if (itemQtde <= 0) {
                    const error = new Error('quantidade do medicamento deve ser maior que ZERO.');
                    error.statusCode = 400;
                    throw error;
                }

                if (!itemLote) {
                    const error = new Error('Lote do medicamento é obrigatório.');
                    error.statusCode = 400;
                    throw error;
                }

                if (!itemLoteValidade || Number.isNaN(new Date(itemLoteValidade).getTime())) {
                    const error = new Error('Validade do lote do medicamento é obrigatória e deve ser uma data válida.');
                    error.statusCode = 400;
                    throw error;
                }

                // Validar a validade do lote
                const validadeDate = new Date(itemLoteValidade);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); // Zerar horas, minutos, segundos e milissegundos para comparação apenas de datas

                if (validadeDate < hoje) {
                    const error = new Error(`Validade do lote do medicamento ${itemMedId} expirou.`);
                    error.statusCode = 400;
                    throw error;
                }

                // Validar os dados do item
                await medicamentos.BuscarPorId(itemMedId);

                if (!medicamentos.found) {
                    const error = new Error(`Medicamento ${itemMedId} não encontrado.`);
                    error.statusCode = 404;
                    throw error;
                }

                await itensEntradas.BuscarPorId(0)

                itensEntradas.ite_ent_id = entradas.ent_id;
                itensEntradas.ite_ent_med_id = itemMedId;
                itensEntradas.ite_ent_lote = itemLote;
                itensEntradas.ite_ent_lote_validade = itemLoteValidade;
                itensEntradas.ite_ent_qtde = itemQtde;

                await itensEntradas.Salvar();

                await demandas.BuscarPorPaciente(ent_pac_id);

                if (!demandas.found) {
                    const error = new Error(`Demanda específica para o paciente ${ent_pac_id} não encontrada.`);
                    error.statusCode = 404;
                    throw error;
                }

                await itensDemandas.BuscarPorId(0);

                itensDemandas.ite_dem_med_ativo = 1;
                itensDemandas.ite_dem_med_qtde = itemQtde;
                itensDemandas.ite_dem_id = demandas.dem_id;
                itensDemandas.ite_dem_med_id = itemMedId;
                
                await itensDemandas.Salvar();
                
            }

            await db.Commit();

            resdata.msg = "Entradas salvas com sucesso.";

            resdata.data = {
                ent_id: entradas.ent_id,
                ent_doc: entradas.ent_doc,
                ent_doc_auto_generated: !ent_doc_informado,
                total_itens: itens.length
            };
           
        } catch (error :any) {
            void await db.Rollback();
            applyControllerError(resdata, error, 'Controller Demandas Específicas');
        }
        
        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

    static async ListarPacientes(req: Request, res: Response) {

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
            const dados = await demandasEspecificas.ListarPacientes();

            resdata.data = dados;
            
        } catch (error) {
            applyControllerError(resdata, error, 'Controller Demandas Específicas.ListarPacientes');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }
        
}
