import express, { Express } from "express";
import cors from "cors";
import router from "./src/routes/router";

const app: Express = express();
const port = 3000;

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.listen(port, () => {
	console.log(`server is running, port:${port}`);
});
