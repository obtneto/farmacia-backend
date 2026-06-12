import { Request, Response } from "express";
import Database, { iDatabase } from "../connections/dbconn.js";
import Entradas from "../model/dao_entradas.js";
import Estoque from "../model/dao_estoque.js";
import ItensEntradas from "../model/dao_itens_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_Entradas {

    static async ListarTodos(req: Request, res: Response) {
        
        const db: iDatabase = new Database();
        
        const resdata : iresdata = {
                err: 0,
                msg: '',
                status: 200,
                data: {}
            }

        try {

            await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const dep_id = Number(req.params.dep_id || 0)
            const data_inicio = new Date(String(req.params.data_inicio));
            const data_fim = new Date(String(req.params.data_fim));

            if (dep_id === 0) {
                 const error = new Error('Deposito inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(data_inicio.getTime())) {
                const error = new Error('Data de início inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(data_fim.getTime())) {
                const error = new Error('Data de fim inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (data_inicio > data_fim) {
                const error = new Error('Data de início deve ser menor que a data de fim')
                error.statusCode =  400;
                throw error;
            }

            const entradas = new Entradas(db.connection);

            const result = await entradas.ListarPeriodo(pesq, data_inicio, data_fim,dep_id);

            resdata.data = result;

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async BuscarPorId(req: Request, res: Response) {
        
        const db: iDatabase = new Database();

        const resdata: iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        };

        try {

            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);

            const entrada = await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            const itens = await itensEntradas.ListarItens(ent_id);
            const quantidade_total = itens.reduce((total, item) => total + Number(item.quantidade || 0), 0);

            resdata.data = {
                ...entrada,
                itens,
                total_itens: itens.length,
                quantidade_total
            };

        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async Salvar(req: Request, res: Response) {
        
        const db: iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status:200,
            data: []
        };

        try {

            await db.Connect();
            await db.Begin();

            const ent_id = Number(req.body.ent_id || 0);
            const ent_date = new Date(req.body.ent_date);
            let ent_doc = String(req.body.ent_doc || '');
            const ent_doc_informado = ent_doc.trim().length > 0;
            const ent_for_id = Number(req.body.ent_for_id || 0);
            const ent_dep_id = Number(req.body.ent_dep_id || 0);
            const itens = Array.isArray(req.body.itens) ? req.body.itens : null

            if (Number.isNaN(ent_date.getTime())) {
                const error = new Error('Data da entrada é obrigatória.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_for_id === 0) {
                const error = new Error('Fornecedor não Informado.');
                error.statusCode = 400;
                throw error;
            }

            if (ent_dep_id <= 0) {
                const error = new Error('Depósito de destino é obrigatório.');
                error.statusCode = 400;
                throw error;
            }

            if (!itens || itens.length === 0) {
                const error = new Error('Adicione pelo menos um item à entrada.');
                error.statusCode = 400;
                throw error;
            }

            if (!ent_doc) {
                const anoAtual = new Date().getFullYear();
                const mesAtual = (new Date().getMonth() + 1).toString().padStart(2,'0');
                const numeroAleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                
                ent_doc = `${anoAtual}${mesAtual}${numeroAleatorio}`;
            }

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const medicamentos = new Medicamentos(db.connection);
        
            void await entradas.BuscarPorId(ent_id);

            entradas.ent_date = ent_date;
            entradas.ent_doc = ent_doc;
            entradas.ent_dep_id = ent_dep_id;
            entradas.ent_for_id = ent_for_id;
            entradas.ent_status = 0;

            await entradas.Salvar();

            for (const item of itens) {

                const itemMedId = Number(item.ent_med_id || 0);
                const itemLote = String(item.ent_lote || '');
                const itemLoteValidade = item.ent_lote_validade;
                const itemQtde = Number(item.ent_qtde || 0);

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

            }

            await db.Commit();

            resdata.msg = 'Entrada salva com sucesso';
            resdata.data = {
                ent_id: entradas.ent_id,
                ent_doc: entradas.ent_doc,
                ent_doc_auto_generated: !ent_doc_informado,
                total_itens: itens.length
            };
        } catch (error: any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async ListarItens(req: Request, res: Response) {

        const db : iDatabase = new Database('fsph_farmacia');

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const itensEntradas = new ItensEntradas(db.connection);

            const result = await itensEntradas.ListarItens(ent_id);

            resdata.data = result;
            
        } catch (error) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);

    }

    static async ListarEntradasNaoAprovados(req: Request, res: Response) {

        const db : iDatabase = new Database('fsph_farmacia');

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const dep_id = Number(req.params.dep_id || 0)
            const data_inicio = new Date(String(req.params.data_inicio));
            const data_fim = new Date(String(req.params.data_fim));

            if (dep_id === 0) {
                 const error = new Error('Deposito inválido') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(data_inicio.getTime())) {
                const error = new Error('Data de início inválida') as any;
                error.statusCode = 400;
                throw error;
            }

            if (Number.isNaN(data_fim.getTime())) {
                const error = new Error('Data de fim inválida') as any;
                error.statusCode = 400;
                throw error
            }

            if (data_inicio > data_fim) {
                const error = new Error('Data de início deve ser menor que a data de fim')
                error.statusCode =  400;
                throw error;
            }

            const entradas = new Entradas(db.connection);

            const result = await entradas.ListarEntradasNaoAprovados(pesq, data_inicio, data_fim, dep_id);

            resdata.data = result;

        } catch (error) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();

        return res.status(resdata.status).json(resdata);
    }

    static async AprovarEntrada(req: Request, res: Response) {

        const db : iDatabase = new Database('fsph_farmacia');

        const resdata : iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []
        }

        try {

            await db.Connect();
            await db.Begin();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                const error = new Error('ID da entrada inválido');
                error.statusCode = 400;
                throw error;
            }

            const entradas = new Entradas(db.connection);
            const estoque = new Estoque(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);

            await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                const error = new Error('Entrada não encontrada.');
                error.statusCode = 404;
                throw error;
            }

            if (entradas.ent_status === 1) {
                const error = new Error('Entrada já aprovada.');
                error.statusCode = 400;
                throw error;
            }

            const itens = await itensEntradas.ListarItens(ent_id);

            for (const item of itens) {

                const est_dep_id = entradas.ent_dep_id || 0;
                const est_med_id = item.ent_med_id || 0;
                const est_lote = item.ent_lote || '';
                const est_validade = item.ent_lote_validade || null;
                const est_qtde = item.ent_ent_qtde || 0;

                await estoque.BuscarPorItemEstoque(est_dep_id, est_med_id, est_lote);

                if (estoque.found) {
                    
                    estoque.est_saldo_disponivel += est_qtde;
                    
                    if (est_validade) {
                        estoque.est_validade = est_validade;
                    }
                   
                } else {

                    estoque.est_dep_id = est_dep_id;
                    estoque.est_med_id = est_med_id;
                    estoque.est_lote = est_lote;
                    estoque.est_validade = est_validade;
                    estoque.est_saldo_disponivel = est_qtde;
                    estoque.est_saldo_bloqueado = 0;

                }

                await estoque.Salvar();
            }

            entradas.ent_status = 1;
            await entradas.Salvar();

            await db.Commit();

            resdata.msg = 'Entrada aprovada com sucesso';

        } catch (error) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }
}
