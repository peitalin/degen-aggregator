
import {
  Route,
  Empty,
  HttpMethod,
} from "~/routeTypings";

const FRONT_PAGE_URL = '/'

const frontPageTestRoute: Route<Empty, Empty, Empty> = {
  path: FRONT_PAGE_URL,
  method: HttpMethod.GET,
  paramsType: Empty,
  queryType: Empty,
  bodyType: Empty,
  handler: async (req, res, next, params, query, body) => {

    res.send(`
    <div style="margin: 2rem">
      <h2>GM Aggregator</h2>
    </div>
    `)
  }
};

const frontPageRoutes: Route<any, any, any>[] = [
  frontPageTestRoute,
];
export default frontPageRoutes


export const RoutePaths = {
  frontPageTest: FRONT_PAGE_URL,
	// used guns
  frontPageHackerNews: "/ug",
};
