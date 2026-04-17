import { Helmet } from "react-helmet-async";
import { sanitizeJsonForScript } from "@/lib/seo";

type JsonLdSchema = Record<string, unknown>;

type SchemaInjectorProps = {
  schemas?: Array<JsonLdSchema | null | undefined | false>;
};

export function SchemaInjector({ schemas = [] }: SchemaInjectorProps) {
  const normalizedSchemas = schemas.filter(
    (schema): schema is JsonLdSchema => Boolean(schema) && typeof schema === "object",
  );

  if (normalizedSchemas.length === 0) {
    return null;
  }

  return (
    <Helmet>
      {normalizedSchemas.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeJsonForScript(schema) }}
        />
      ))}
    </Helmet>
  );
}
