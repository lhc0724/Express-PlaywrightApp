import express from 'express';
import naverShopping from './naverShopping';

const router = express.Router();

router.use("/nss", naverShopping);

export default router