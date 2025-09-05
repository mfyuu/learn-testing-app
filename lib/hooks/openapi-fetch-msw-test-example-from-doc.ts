// openapi-fetchのテストコードの例（公式ドキュメントに記載）
// see: https://openapi-ts.dev/ja/openapi-fetch/testing
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import createClient from "openapi-fetch";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import type { paths } from "../api/types";

const server = setupServer();

beforeAll(() => {
	// NOTE: server.listenは、`createClient`が使用される前に呼び出される必要があります。
	// これにより、mswが自身の`fetch`バージョンをインジェクトしてリクエストをインターセプトできます。
	server.listen({
		onUnhandledRequest: (request) => {
			throw new Error(
				`No request handler found for ${request.method} ${request.url}`,
			);
		},
	});
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("my API call", async () => {
	const rawData = [
		{ id: "1", title: "テストTodo1", completed: false },
		{ id: "2", title: "テストTodo2", completed: true },
	];

	const BASE_URL = "https://learn-testing-api.mfyuu.workers.dev";

	server.use(
		http.get(`${BASE_URL}/api/todos`, () =>
			HttpResponse.json(rawData, { status: 200 }),
		),
	);

	const client = createClient<paths>({
		baseUrl: BASE_URL,
	});

	const { data, error } = await client.GET("/api/todos");

	expect(data).toEqual(rawData);
	expect(error).toBeUndefined();
});
