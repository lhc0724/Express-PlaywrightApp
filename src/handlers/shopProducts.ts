import { Locator, chromium } from "playwright";
import { productList } from "../interfaces";

const getShopProductList = async (url: string) => {
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	await page.goto(url);
	await page.waitForLoadState("networkidle");

	let productList: productList[] = [];

	try {
		const productsLocator = page.locator("div#CategoryProducts");
		const viewButton = productsLocator.getByTitle("상품 리스트 출력 개수 선택");

		if ((await viewButton.count()) < 1) {
			throw new Error("Product list page in unsupported format.");
		}

		await viewButton.click();
		await page.waitForTimeout(100);

		await productsLocator
			.getByRole("listitem")
			.getByText("80개씩 보기")
			.click();
		await page.waitForTimeout(500);

		let productCount = await productsLocator
			.getByText("(총")
			.getByRole("strong")
			.innerText();

		let totalPage = Math.ceil(parseInt(productCount.replace(/,/g, "")) / 80);

		let pageUrl = page.url();

		for (var i = 0; i < totalPage; i++) {
			let menuItem = productsLocator.getByRole("menuitem").nth(i % 10);

			if ((await menuItem.getAttribute("aria-current")) == "false") {
				await menuItem.click();
				await page.waitForTimeout(500);
			}

			const itemElements: Locator[] = await productsLocator
				.locator("ul>li>div>a")
				.all();

			for (const item of itemElements) {
				const strongTags = await item.getByRole("strong").all();

				let title = await strongTags[strongTags.length - 1].innerText();
				let price = await strongTags[strongTags.length - 2].innerText();

				let hasThumbnail: boolean = (await item.getByRole("img").count()) > 0;
				let thumbnail: string = "";

				if (hasThumbnail) {
					thumbnail =
						(await item.getByRole("img").first().getAttribute("src")) ?? "";
				}
				let itemDetailUrl = await item.getAttribute("href");
				productList.push({
					price,
					title,
					thumbnail,
					url: `https://${pageUrl.split("/").at(2)}${itemDetailUrl}`,
				});
			}

			if ((i + 1) % 10 == 0) {
				var nexts = await productsLocator
					.locator("div>a")
					.getByText("다음")
					.all();

				var nextButton = await nexts[nexts.length - 1].getAttribute("role");
				if (nextButton == "button") {
					await nexts[nexts.length - 1].click();
				}
				await page.waitForLoadState("networkidle");
				await page.waitForTimeout(1000);
			}
		}
	} catch (error) {
		console.log(error);
	} finally {
		context.close();
		browser.close();
	}

	return productList;
};

export default getShopProductList;
