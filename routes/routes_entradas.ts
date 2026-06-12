import {Router} from 'express';
import Controller_Entradas from '../controllers/controller_entradas.js';

const router = Router();

router.get('/listar/:pesq/:data_inicio/:data_fim/:dep_id',Controller_Entradas.ListarTodos);
router.get('/buscar/:ent_id',Controller_Entradas.BuscarPorId);
router.get('/listar-nao-aprovados/:pesq/:data_inicio/:data_fim/:dep_id',Controller_Entradas.ListarEntradasNaoAprovados);
router.get('/itens/:ent_id',Controller_Entradas.ListarItens);
router.post('/salvar',Controller_Entradas.Salvar);

export default router;