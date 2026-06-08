import {Router} from 'express';
import Controller_DemandasEspecificas from '../controllers/controller_demandas_especificas.js';

const router = Router();

router.get('/buscar/:id_demanda',Controller_DemandasEspecificas.Buscar);
router.get('/listar/:pesq',Controller_DemandasEspecificas.Listar);
router.post('/salvar',Controller_DemandasEspecificas.Salvar);
router.delete('/excluir/:demanda_id',Controller_DemandasEspecificas.Excluir);

export default router;  