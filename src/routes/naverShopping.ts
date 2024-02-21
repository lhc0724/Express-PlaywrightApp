import express, { Request, Response } from "express";
import { getNaverShoppingDetail } from "../handlers";

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

export default naverShoppingRouter;