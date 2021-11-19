
import frontPageRoutes from "./scraperRoutes"
import hackernewsRoutes from "./scraperRoutes/hackernews-routes";

export default [
	...frontPageRoutes,
	...hackernewsRoutes,
];
