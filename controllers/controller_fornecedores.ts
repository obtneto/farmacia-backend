import Database, { iDatabase } from '../connections/dbconn.js';
import Fonecedores, {iFornecedoresFields}  from '../model/dao_forncedores.js';
import { Request, Response } from 'express';
import { iresdata } from './interface_controllers.js';
import { applyControllerError } from "../utils/controllerError.js";

export default class Controller_Fornecedores {

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

            const fornecedor_id : number = Number(req.params.id_fornecedor || 0);

            if (fornecedor_id === 0) {
                const error = new Error('ID Fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fonecedores(db.connection);
            const dados = await fornecedores.BuscarPorId(fornecedor_id) as iFornecedoresFields;

            if (!fornecedores.found) {
                const error = new Error('Fornecedor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
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

            const pesq : string = String(req.query.pesq || '*').trim();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fonecedores(db.connection);
            const dados = await fornecedores.Listar(pesq) as iFornecedoresFields[];

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    }

    static async ListarAtivos(req: Request, res: Response) {

        const db : iDatabase = new Database();

        const resdata :iresdata = {
            err: 0,
            msg: '',
            status: 200,
            data: []

        };

        try {

            void await db.Connect();

            const pesq : string = String(req.query.pesq || '*').trim();

            if (!req.params.pesq && pesq !== '*') {
                const error = new Error('Texto de pesquisa não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fonecedores(db.connection);
            const dados = await fornecedores.ListarAtivos(pesq) as iFornecedoresFields[];

            resdata.data = dados;

        } catch (error :any) {
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);
    
    } 

    static async Salvar(req: Request, res: Response) {

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

            const fornecedor_id : number = Number(req.params.id_fornecedor || 0);

            const fornecedores = new Fonecedores(db.connection);

            if (fornecedor_id > 0) {
                fornecedores.for_id = fornecedor_id;
                await fornecedores.BuscarPorId(fornecedor_id);
                if (!fornecedores.found) {
                    const error = new Error('Fornecedor não encontrado');
                    error.statusCode = 404;
                    throw error;
                }
            }

            fornecedores.for_razao_social = String(req.body.for_razao_social || '').trim();
            fornecedores.for_nome_fantasia = String(req.body.for_nome_fantasia || '').trim();
            fornecedores.for_cnpj = String(req.body.for_cnpj || '').trim();
            fornecedores.for_logradouro = String(req.body.for_logradouro || '').trim();
            fornecedores.for_numero = String(req.body.for_numero || '').trim();
            fornecedores.for_bairro = String(req.body.for_bairro || '').trim();
            fornecedores.for_cidade = String(req.body.for_cidade || '').trim();
            fornecedores.for_uf = String(req.body.for_uf || '').trim();
            fornecedores.for_cep = String(req.body.for_cep || '').trim();
            fornecedores.for_telefone = String(req.body.for_telefone || '').trim();
            fornecedores.for_email = String(req.body.for_email || '').trim();
            fornecedores.for_ativo = req.body.for_ativo ? 1 : 0;

            await fornecedores.Salvar();

            await db.Commit();

            resdata.data = {for_id: fornecedores.for_id};

        } catch (error :any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Fornecedores');
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

            void await db.Begin();

            const fornecedor_id : number = Number(req.params.id_fornecedor || 0);

            if (fornecedor_id === 0) {
                const error = new Error('ID Fornecedor não informado');
                error.statusCode = 400;
                throw error;
            }

            const fornecedores = new Fonecedores(db.connection);
            await fornecedores.BuscarPorId(fornecedor_id);

            if (!fornecedores.found) {
                const error = new Error('Fornecedor não encontrado');
                error.statusCode = 404;
                throw error;
            }

            await fornecedores.Excluir(fornecedor_id);

            await db.Commit();

        } catch (error :any) {
            await db.Rollback();
            applyControllerError(resdata, error, 'Controller Fornecedores');
        }

        void await db.Disconnect();

        res.status(resdata.status).json(resdata);

    }

}
