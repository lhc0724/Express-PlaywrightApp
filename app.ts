import express, { Express, Request, Response } from "express";

const app: Express = express();
const port = 3000;

app.listen(port, () => {
	console.log(`server is running, port:${port}`);
});
