import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

export function initializeOpenTelemetry() {
  const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  if (!otelEndpoint) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);
    diag.warn(
      'OTEL_EXPORTER_OTLP_ENDPOINT not set, skipping OpenTelemetry initialization',
    );
    return;
  }

  const traceExporter = new OTLPTraceExporter({
    url: otelEndpoint,
  });

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .catch((error) =>
        console.error('Error shutting down OpenTelemetry SDK', error),
      );
  });
}
