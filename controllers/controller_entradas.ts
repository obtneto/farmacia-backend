import { Request, Response } from "express";
import { randomInt } from "crypto";
import Database, { iDatabase } from "../connections/dbconn.js";
import Entradas from "../model/dao_entradas.js";
import Estoque from "../model/dao_estoque.js";
import ItensEntradas, { iItemEntradaFields } from "../model/dao_itens_entradas.js";
import Medicamentos from "../model/dao_medicamentos.js";
import { iresdata } from "./interface_controllers.js";
import { applyControllerError } from "../utils/controllerError.js";

interface iSalvarEntradaItemPayload {
    ent_med_id: number;
    ent_lote: string;
    ent_lote_validade: string;
    ent_qtde: number;
}

interface iSalvarEntradaPayload {
    ent_id?: number;
    ent_date: string;
    ent_doc?: string | number | null;
    ent_fornecido_por: string;
    ent_dep_id: number;
    itens: iSalvarEntradaItemPayload[];
}

function createResponseData(): iresdata {
    return {
        err: 0,
        msg: '',
        status: 200,
        data: null
    };
}

function createHttpError(message: string, statusCode: number): Error & { statusCode: number } {
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = statusCode;
    return error;
}

function generateEntradaDocumento(referenceDate: Date): string {
    const baseDate = Number.isNaN(referenceDate.getTime()) ? new Date() : referenceDate;
    const year = String(baseDate.getFullYear());
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const sequence = String(randomInt(100000, 1000000));

    return `${year}${month}${sequence}`;
}

function normalizeEntradaDocumento(rawValue: iSalvarEntradaPayload['ent_doc'], referenceDate: Date): string {
    if (rawValue === null || rawValue === undefined) {
        return generateEntradaDocumento(referenceDate);
    }

    if (typeof rawValue === 'number') {
        return rawValue === 0
            ? generateEntradaDocumento(referenceDate)
            : String(rawValue).trim().toLocaleUpperCase();
    }

    const normalizedValue = String(rawValue).trim().toLocaleUpperCase();

    if (!normalizedValue || /^0+$/.test(normalizedValue)) {
        return generateEntradaDocumento(referenceDate);
    }

    return normalizedValue;
}

function shouldAutoGenerateEntradaDocumento(rawValue: iSalvarEntradaPayload['ent_doc']): boolean {
    if (rawValue === null || rawValue === undefined) {
        return true;
    }

    if (typeof rawValue === 'number') {
        return rawValue === 0;
    }

    const normalizedValue = String(rawValue).trim().toLocaleUpperCase();
    return !normalizedValue || /^0+$/.test(normalizedValue) || normalizedValue === 'NULL' || normalizedValue === 'UNDEFINED';
}

function normalizeHeaderPayload(body: iSalvarEntradaPayload) {
    const ent_id = Number(body.ent_id || 0);
    const ent_date = new Date(body.ent_date);
    const ent_doc_auto_generated = shouldAutoGenerateEntradaDocumento(body.ent_doc);
    const ent_doc = normalizeEntradaDocumento(body.ent_doc, ent_date);
    const ent_fornecido_por = String(body.ent_fornecido_por || '').trim().toLocaleUpperCase();
    const ent_dep_id = Number(body.ent_dep_id || 0);
    const itens = Array.isArray(body.itens) ? body.itens : [];

    return {
        ent_id,
        ent_date,
        ent_doc,
        ent_doc_auto_generated,
        ent_fornecido_por,
        ent_dep_id,
        itens
    };
}

function normalizeItemPayload(item: iSalvarEntradaItemPayload, index: number): iItemEntradaFields {
    const ite_ent_med_id = Number(item.ent_med_id || 0);
    const ite_ent_lote = String(item.ent_lote || '').trim().toLocaleUpperCase();
    const ite_ent_lote_validade = item.ent_lote_validade ? new Date(item.ent_lote_validade) : null;
    const ite_ent_qtde = Number(item.ent_qtde || 0);

    if (ite_ent_med_id <= 0) {
        throw createHttpError(`Item ${index + 1}: medicamento é obrigatório.`, 400);
    }

    if (!ite_ent_lote) {
        throw createHttpError(`Item ${index + 1}: lote é obrigatório.`, 400);
    }

    if (!ite_ent_lote_validade || Number.isNaN(ite_ent_lote_validade.getTime())) {
        throw createHttpError(`Item ${index + 1}: validade do lote é obrigatória.`, 400);
    }

    if (!Number.isFinite(ite_ent_qtde) || ite_ent_qtde <= 0) {
        throw createHttpError(`Item ${index + 1}: quantidade deve ser maior que zero.`, 400);
    }

    return {
        ite_id: 0,
        ite_ent_id: 0,
        ite_ent_med_id,
        ite_ent_lote,
        ite_ent_lote_validade,
        ite_ent_qtde
    };
}

function buildDuplicateMedicationGuard(items: iItemEntradaFields[]) {
    const usedMedicamentos = new Set<number>();

    for (const item of items) {
        if (usedMedicamentos.has(item.ite_ent_med_id)) {
            throw createHttpError('Não é permitido repetir o mesmo medicamento na mesma entrada.', 400);
        }

        usedMedicamentos.add(item.ite_ent_med_id);
    }
}

export default class Controller_Entradas {

    static async ListarTodos(req: Request, res: Response) {
        const db: iDatabase = new Database();
        const resdata = createResponseData();

        try {
            await db.Connect();

            const pesq = String(req.params.pesq || '*');
            const data_inicio = new Date(String(req.params.data_inicio));
            const data_fim = new Date(String(req.params.data_fim));

            if (Number.isNaN(data_inicio.getTime())) {
                throw createHttpError('Data de início inválida', 400);
            }

            if (Number.isNaN(data_fim.getTime())) {
                throw createHttpError('Data de fim inválida', 400);
            }

            if (data_inicio > data_fim) {
                throw createHttpError('Data de início deve ser menor que a data de fim', 400);
            }

            const entradas = new Entradas(db.connection);
            resdata.data = await entradas.ListarTodos(pesq, data_inicio, data_fim);
        } catch (error: any) {
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }

    static async BuscarPorId(req: Request, res: Response) {
        const db: iDatabase = new Database();
        const resdata = createResponseData();

        try {
            await db.Connect();

            const ent_id = Number(req.params.ent_id || 0);

            if (ent_id <= 0) {
                throw createHttpError('ID da entrada inválido', 400);
            }

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);

            const entrada = await entradas.BuscarPorId(ent_id);

            if (!entradas.found) {
                throw createHttpError('Entrada não encontrada', 404);
            }

            const itens = await itensEntradas.ListarPorEntrada(ent_id);
            const quantidade_total = itens.reduce((total, item) => total + Number(item.ite_ent_qtde || 0), 0);

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
        const resdata = createResponseData();

        try {
            await db.Connect();
            await db.Begin();

            const payload = normalizeHeaderPayload(req.body as iSalvarEntradaPayload);
            const itens = payload.itens.map((item, index) => normalizeItemPayload(item, index));

            if (payload.ent_id > 0) {
                throw createHttpError('Alteração de entradas existentes não é suportada no schema atual.', 409);
            }

            if (Number.isNaN(payload.ent_date.getTime())) {
                throw createHttpError('Data da entrada é obrigatória.', 400);
            }

            if (!payload.ent_fornecido_por) {
                throw createHttpError('Fornecedor da entrada é obrigatório.', 400);
            }

            if (payload.ent_dep_id <= 0) {
                throw createHttpError('Depósito de destino é obrigatório.', 400);
            }

            if (itens.length === 0) {
                throw createHttpError('Adicione pelo menos um item à entrada.', 400);
            }

            buildDuplicateMedicationGuard(itens);

            const entradas = new Entradas(db.connection);
            const itensEntradas = new ItensEntradas(db.connection);
            const estoque = new Estoque(db.connection);
            const medicamentos = new Medicamentos(db.connection);

            entradas.ent_date = payload.ent_date;
            entradas.ent_doc = payload.ent_doc;
            entradas.ent = payload.ent_fornecido_por;

            await entradas.Salvar();

            for (const item of itens) {
                await medicamentos.BuscarPorId(item.ite_ent_med_id);

                if (!medicamentos.found) {
                    throw createHttpError(`Medicamento ${item.ite_ent_med_id} não encontrado.`, 404);
                }

                item.ite_ent_id = entradas.ent_id;

                try {
                    await itensEntradas.Inserir(item);
                } catch (error: any) {
                    if (error?.code === 'ER_DUP_ENTRY') {
                        throw createHttpError(
                            `Conflito de índice ao gravar o item ${item.ite_id || 'novo'} da entrada ${item.ite_ent_id}. Verifique se os índices de tb_itens_entradas permitem este medicamento/lote dentro da mesma entrada.`,
                            409
                        );
                    }

                    throw error;
                }

                await estoque.BuscarPorItemEstoque(item.ite_ent_med_id, payload.ent_dep_id, item.ite_ent_lote);

                estoque.est_med_id = item.ite_ent_med_id;
                estoque.est_dep_id = payload.ent_dep_id;
                estoque.est_lote = item.ite_ent_lote;
                estoque.est_validade = item.ite_ent_lote_validade || new Date();
                estoque.est_saldo = estoque.found
                    ? Number(estoque.est_saldo) + Number(item.ite_ent_qtde)
                    : Number(item.ite_ent_qtde);

                await estoque.Salvar();
            }

            await db.Commit();

            resdata.msg = 'Entrada salva com sucesso';
            resdata.data = {
                ent_id: entradas.ent_id,
                ent_doc: entradas.ent_doc,
                ent_doc_auto_generated: payload.ent_doc_auto_generated,
                total_itens: itens.length
            };
        } catch (error: any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Entradas');
        }

        await db.Disconnect();
        return res.status(resdata.status).json(resdata);
    }
}
