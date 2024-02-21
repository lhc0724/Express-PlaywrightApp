interface naverCategory {
	wholeId: string;
	path: string;
}

interface productDetail {
	productId: string;
	channelName: string;
	sku: string;
	category: naverCategory;
	title: string;
	beforeDiscount: string;
	price: string;
	thumbnails: string[];
	mainImages: string[];
	optionUsable: boolean;
	tiers: string[] | null;
	options: any[];
	stock: string;
	content: string;
	contentHtml: string;
}

export { productDetail, naverCategory };
