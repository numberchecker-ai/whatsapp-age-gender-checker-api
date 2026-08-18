# WhatsApp Profile Checker API — Bulk Verification | NumberChecker

The **WhatsApp Profile Checker API** accepts a text file of phone numbers, creates an asynchronous bulk task, and exports a result file. This repository contains a runnable integration in eight languages.

- **Product page:** https://numberchecker.ai/products/whatsapp-age-gender-checker
- **API documentation:** https://docs.numberchecker.ai/whatsapp-bulk-number-checker-avatar
- **API base URL:** `https://api.numberchecker.ai`
- **Authentication:** `X-API-Key`
- **Get an API key:** https://platform.numberchecker.ai

> [!NOTE]
> This repository covers the standalone product code `ws_avatar` only. Other product codes are outside its scope.

## Product facts

| API fact | Value |
|---|---|
| Product code | `ws_avatar` |
| Input | Text file, one phone per line |
| Processing mode | Asynchronous bulk task |
| Minimum batch | 500 identifiers |
| Maximum batch | 10,000,000 identifiers |
| Export fields | `number`, `activated`, `age`, `avatar`, `category`, `gender`, `hair_color`, `skin_color` |

The current catalog notes: The live sample previously contained a duplicate number header; the catalog normalizes it to one canonical number field.

## Workflow

1. Submit the input file to `POST /v1/tasks` with `task_type=ws_avatar`.
2. Poll `POST /v1/gettasks` with the returned `task_id`.
3. When `status=exported`, download `result_url`.

```bash
export NUMBERCHECKER_API_KEY="YOUR_API_KEY"
curl -X POST 'https://api.numberchecker.ai/v1/tasks' \
  -H "X-API-Key: $NUMBERCHECKER_API_KEY" \
  -F 'file=@examples/numbers.txt' \
  -F 'task_type=ws_avatar'
```

Task states are `pending`, `processing`, `exported`, and `failed`. Download the result only after export and preserve the returned column names exactly. `GET /v1/balance` reads the current account balance.

## Input and output

Provide one phone number per line in international E.164 format, including the country code. The exported fields are: `number`, `activated`, `age`, `avatar`, `category`, `gender`, `hair_color`, `skin_color`.

## Errors and safe integration

Typical responses include `400` invalid input, `401` invalid API key, `402` insufficient balance, `404` unknown task, `413` oversized upload, and `500` temporary server error. Retry transient `500` responses with capped backoff; correct the input or credentials before retrying other errors. Read keys from `NUMBERCHECKER_API_KEY` and never expose them in browser code or source control. Process only identifiers you are authorized to verify.

## Runnable examples

Complete submit → poll → download clients are available in the server-side examples:

- [`examples/python`](examples/python)
- [`examples/nodejs`](examples/nodejs)
- [`examples/go`](examples/go)
- [`examples/java`](examples/java)
- [`examples/csharp`](examples/csharp)
- [`examples/php`](examples/php)
- [`examples/javascript`](examples/javascript)
- [`examples/shell`](examples/shell)

Run the server-side examples from the repository root using the exact commands listed in each language README; each command passes `examples/numbers.txt`. The browser example returns the exported `result_url` to the caller and expects a same-origin backend proxy to add `X-API-Key` server-side. All server-side examples read `NUMBERCHECKER_API_KEY` from the environment and fail fast if it is missing.

## FAQ

### Is this a realtime single-identifier API?

No. It is an asynchronous bulk API for uploaded lists.

### Which product does this repository support?

Only `ws_avatar`. The task type is intentionally fixed to that product code.

### Where can I find current pricing?

See the [NumberChecker pricing page](https://numberchecker.ai/pricing). This repository does not hard-code a price.

## Official resources

- **Product:** https://numberchecker.ai/products/whatsapp-age-gender-checker
- **Documentation:** https://docs.numberchecker.ai/whatsapp-bulk-number-checker-avatar
- **Dashboard and API keys:** https://platform.numberchecker.ai
- **Pricing:** https://numberchecker.ai/pricing
- **OpenAPI contract:** [`openapi.yaml`](openapi.yaml)
- **License:** [MIT](LICENSE)

NumberChecker is not affiliated with the third-party service named by this product family. Use this API only for authorized processing and comply with applicable privacy laws and platform terms.

*Last reviewed: 2026-08-18 · Maintained by NumberChecker.*
