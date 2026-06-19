import {Router,Request,Response} from 'express';
import {opcoes} from '../utils/opcoes.js'

const router = Router();

router.get('/opcoes',(req: Request,res: Response) => {
      
      try {
            res.status(200).json(opcoes);
      } catch (error) {
            res.status(500).json({err: error})
      }
});

export default router;