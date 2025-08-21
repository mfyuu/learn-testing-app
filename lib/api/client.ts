import createClient from "openapi-fetch";
import type { paths } from "./types";

export const apiClient = createClient<paths>({
	baseUrl: "https://learn-testing-api.mfyuu.workers.dev",
});
