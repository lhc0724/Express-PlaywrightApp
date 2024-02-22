import { Locator, Page, chromium } from "playwright";
import { productDetail } from "../interfaces";

const getImages = async (page: Page, parentLocator: Locator) => {
	const seContentImgs = parentLocator
		.locator(".se-main-container")
		.locator(".se-image-resource")
		.or(parentLocator.locator(".se-inline-image-resource"));

	let isVaildContent = (await seContentImgs.count()) > 0;

	const imageCollection = isVaildContent
		? await seContentImgs.all()
		: await parentLocator.getByRole("img").all();

	let images: string[] = [];

	for (const img of imageCollection) {
		await img.scrollIntoViewIfNeeded();
		if (await img.isVisible()) {
			await page.waitForTimeout(100);

			let mainImg = await img.getAttribute("src");
			if (mainImg !== null) {
				images.push(mainImg);
			}
		}
	}

	return images;
};

const getNaverShoppingDetail = async (
	url: string
): Promise<productDetail | null> => {
	let paths = new URL(url).pathname.split("/");
	const productId = paths[paths.length - 1];

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	let res: productDetail | null = null;

	try {
		await page.emulateMedia({ media: "screen" });
		await page.goto(url);

		await page.waitForLoadState("networkidle");

		const headLocator = page.locator('script[data-react-helmet="true"]');
		const introduce = page.locator("div#INTRODUCE");
		const infoLocator = introduce.locator("._3osy73V_eD");

		let detailHead = JSON.parse((await headLocator.textContent()) ?? "");

		// naver preload state에 실려있는 오브젝트 파싱
		const { product } = await page.evaluate(() => {
			return (<any>window).__PRELOADED_STATE__;
		});

		if (product === null || product === 'undefined')
		{
			return null;
		}

		// 썸네일 이미지 scrap
		let thumbnails = product.A.productImages.map(
			(e: any) => `${e.url}?type=m510`
		);

		// 본문 이미지
		let mainImages = await getImages(page, infoLocator);

		// scroll down to bottom (스크롤반응 컨텐츠 로딩 때문에 필요)
		for (let i = 0; i < 10; i++) {
			await page.evaluate(() => {
				window.scrollBy(0, document.body.scrollHeight / 10);
			});

			if ((await page.getByText("상세정보 펼쳐보기").count()) > 0) {
				await page.getByText("상세정보 펼쳐보기").click();
				await page.waitForTimeout(500);
				await page.evaluate(() => {
					window.scrollTo(0, document.body.scrollHeight * 0.5);
				});
				break;
			}
		}

		let content = "";
		const contentLocator = page.locator(".se-module-text");
		if ((await contentLocator.count()) > 0) {
			const contentCollection = await contentLocator.all();
			for (const contentItem of contentCollection) {
				content += await contentItem.innerText();
			}
		}

		var contentHtml = await infoLocator.innerHTML();
		contentHtml = contentHtml.replace(/<!--[\s\S]*?-->/g, ""); // 주석 제거
		contentHtml = contentHtml.replace(/\s+/g, " ").trim(); //태그 안의 공백만 제거
		contentHtml = contentHtml.replace(
			/<(div|a|img|span|blockquote|p|hr)\s+>/g,
			"<$1>"
		); //자잘한 태그 정리
		contentHtml = contentHtml.trim();

		let options = [];
		if (product.A.optionUsable && product.A.optionCombinations.length === 0) {
			var filtered = product.A.options.filter(
				(param: any) => param.name != null
			);
			//options = product.A.options.map((e) => {
			options = filtered.map((e: any) => {
				var optionNames = [e.name];
				return {
					id: e.id,
					optionNames,
					stockQuantity: product.A.stockQuantity,
					price: product.A.salePrice,
				};
			});
		} else if (product.A.optionUsable) {
			options = product.A.optionCombinations.map((e: any) => {
				var optionNames = [];

				for (var i = 1; i < 4; i++) {
					var name = e[`optionName${i}`];
					if (name !== undefined) {
						optionNames.push(name);
					}
				}

				return {
					id: e.id,
					optionNames,
					stockQuantity: e.stockQuantity,
					price: e.price,
				};
			});
		}

		res = {
			productId,
			channelName: product.A.channel.channelName,
			sku: detailHead.sku,
			category: {
				wholeId: product.A.category.wholeCategoryId,
				path: product.A.category.wholeCategoryName,
			},
			title: product.A.name,
			beforeDiscount: product.A.salePrice,
			price: product.A.discountedSalePrice,
			thumbnails,
			mainImages,
			optionUsable: product.A.optionUsable,
			tiers: product.A.optionUsable
				? product.A.options.map((e: any) => e.groupName)
				: null,
			options,
			stock: product.A.stockQuantity,
			content,
			contentHtml,
		};
	} catch (error) {
		console.log(error);
	} finally {
		await context.close();
		await browser.close();
	}

	return res;
};

export default getNaverShoppingDetail;