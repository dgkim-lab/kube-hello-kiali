import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (endpoint) {
  const traceUrl = endpoint.endsWith("/v1/traces") ? endpoint : `${endpoint.replace(/\/$/, "")}/v1/traces`;

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: traceUrl }),
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk.shutdown().finally(() => process.exit(0));
  });
}

