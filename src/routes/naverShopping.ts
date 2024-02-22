import express, { Request, Response } from "express";
import { getNaverShoppingDetail, getShopProductList } from "../handlers";

const naverShoppingRouter = express.Router();

naverShoppingRouter.get("/detail", async (req: Request, res: Response) => {
	const url = req.query.url as string;

	if (url === undefined) {
		return res.status(400).json({ message: "invalid param" });
	}

	const detail = await getNaverShoppingDetail(url);
	if (detail == null)
	{
		return res.status(500).json({message: "internal server error"});
	}

	return res.status(200).json(detail);
});

naverShoppingRouter.get("/", async (req: Request, res: Response) => {
	const url = req.query.url as string;

	if (url === undefined) {
		return res.status(400).json({ message: "invalid param" });
	}

	const list = await getShopProductList(url);
	if (list.length == 0)
	{
		return res.status(500).json({message: "internal server error"});
	}

	return res.status(200).json(list);
});

export default naverShoppingRouter;