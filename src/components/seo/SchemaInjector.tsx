import { Helmet } from "react-helmet-async";

type SchemaValue = Record<string, unknown> | null | undefined;

interface SchemaInjectorProps {
  schemas: SchemaValue | SchemaValue[];
}

function serializeSchema(schema: SchemaValue): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/-->/g, "--\\>")
    .replace(/<\/(script)/gi, "<\\/$1");
}

export function SchemaInjector({ schemas }: SchemaInjectorProps) {
  const normalizedSchemas = (Array.isArray(schemas) ? schemas : [schemas]).filter(
    (schema): schema is Record<string, unknown> => Boolean(schema),
  );

  if (normalizedSchemas.length === 0) {
    return null;
  }

  return (
    <Helmet prioritizeSeoTags defer={false}>
      {normalizedSchemas.map((schema, index) => (
        <script
          key={`${String(schema["@type"] || "schema")}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
        />
      ))}
    </Helmet>
  );
}
