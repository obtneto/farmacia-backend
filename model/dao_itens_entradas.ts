import { Connection, RowDataPacket } from "mysql2/promise";

export interface iItemEntradaFields {
    ite_ent_id: number;
    ite_ent_med_id: number;
    ite_ent_lote: string;
    ite_ent_lote_validade: Date | null;
    ite_ent_qtde: number;
}

export interface iItemEntradaDetalhe extends iItemEntradaFields {
    med_descr?: string;
    med_descr_coml?: string;
    med_und?: string;
}

export default class ItensEntradas {

    private connection: Connection;

    constructor(connection: Connection) {
        if (!connection) {
            throw new Error("Conexão com o banco de dados não estabelecida.");
        }

        this.connection = connection;
    }

    async ListarPorEntrada(entradaId: number): Promise<iItemEntradaDetalhe[]> {
        const [rows] = await this.connection.query(
            `SELECT
                i.ite_ent_id,
                i.ite_ent_med_id,
                i.ite_ent_lote,
                i.ite_ent_lote_validade,
                i.ite_ent_qtde,
                m.med_descr,
                m.med_descr_coml,
                m.med_und
             FROM tb_itens_entradas i
             LEFT JOIN tb_medicamentos m ON m.med_id = i.ite_ent_med_id
             WHERE i.ite_ent_id = :entradaId
             ORDER BY m.med_descr, i.ite_ent_med_id`,
            { entradaId }
        ) as RowDataPacket[];

        return rows as iItemEntradaDetalhe[];
    }

    async Inserir(item: iItemEntradaFields): Promise<void> {
        await this.connection.query(
            `INSERT INTO tb_itens_entradas SET
                ite_ent_id = :ite_ent_id,
                ite_ent_med_id = :ite_ent_med_id,
                ite_ent_lote = :ite_ent_lote,
                ite_ent_lote_validade = :ite_ent_lote_validade,
                ite_ent_qtde = :ite_ent_qtde`,
            {
                ite_ent_id: item.ite_ent_id,
                ite_ent_med_id: item.ite_ent_med_id,
                ite_ent_lote: item.ite_ent_lote,
                ite_ent_lote_validade: item.ite_ent_lote_validade,
                ite_ent_qtde: item.ite_ent_qtde
            } as any
        );
    }

    async ExcluirPorEntrada(entradaId: number): Promise<void> {
        await this.connection.query(
            `DELETE FROM tb_itens_entradas WHERE ite_ent_id = :entradaId`,
            { entradaId }
        );
    }
}
