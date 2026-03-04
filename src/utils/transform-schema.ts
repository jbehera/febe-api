export interface Field {
  name: string | false;
  type: string | false;
  pk: boolean;
  unique: boolean;
  not_null: boolean;
  increment: boolean;
  secure: boolean;
  note: string;
  id?: string;
}

export interface Table {
  id: string;
  name: string;
  fields: Field[];
  note?: string;
}

export interface LinkEndpoint {
  id: string;
  fieldId: string;
  relation: string;
}

export interface Link {
  id: string;
  name?: string | null;
  endpoints: LinkEndpoint[];
}

export interface TableDict {
  [id: string]: Table;
}

export interface LinkDict {
  [id: string]: Link;
}

export interface SchemaInput {
  tableDict: TableDict;
  linkDict: LinkDict;
}

export interface RelationMapping {
  [from: string]: string;
}

export interface TableRelation {
  table: string;
  mappings: RelationMapping[];
}

export interface TransformedTable {
  [tableName: string]: {
    fields: Field[] | false;
    relations: TableRelation[];
    note: string;
  };
}

export interface TransformSchemaResult {
  tables: TransformedTable[];
}

export function transformSchema(data: SchemaInput): TransformSchemaResult | null {
  try {
    const schema = data;
    if (!schema || typeof schema !== 'object') {
      throw new Error('Invalid schema provided');
    }

    const result: TransformSchemaResult = {
      tables: [],
    };

    const tableDict = schema.tableDict;
    const linkDict = schema.linkDict;

    if (!tableDict || !linkDict) {
      throw new Error('tableDict or linkDict is missing or invalid');
    }

    // Helper functions
    const getFieldNameById = (tableId: string, fieldId: string) => {
      const table = tableDict[tableId];
      return table?.fields?.find((f) => f.id === fieldId)?.name;
    };

    const getTableNameById = (id: string) => tableDict[id]?.name;

    const tableRelations: { [tableId: string]: TableRelation[] } = {};

    // Relationship grouping logic
    const upsertRelationship = (
      sourceTableId: string,
      targetTableName: string,
      mapping: RelationMapping
    ) => {
      if (!tableRelations[sourceTableId]) tableRelations[sourceTableId] = [];

      const existing = tableRelations[sourceTableId].find(
        (rel) => rel.table === targetTableName
      );

      if (existing) {
        existing.mappings.push(mapping);
      } else {
        tableRelations[sourceTableId].push({
          table: targetTableName,
          mappings: [mapping],
        });
      }
    };

    // Process links
    for (const link of Object.values(linkDict)) {
      try {
        if (!link.endpoints?.length || link.endpoints.length !== 2) continue;

        const [ep1, ep2] = link.endpoints;
        const t1 = ep1.id,
          t2 = ep2.id;
        const f1 = getFieldNameById(t1, ep1.fieldId);
        const f2 = getFieldNameById(t2, ep2.fieldId);
        const tn1 = getTableNameById(t1);
        const tn2 = getTableNameById(t2);

        if (!tn1 || !tn2 || !f1 || !f2) continue;

        // Create bidirectional mappings
        const mapping1: RelationMapping = { [`${tn1}.${f1}`]: `${tn2}.${f2}` };
        const mapping2: RelationMapping = { [`${tn2}.${f2}`]: `${tn1}.${f1}` };

        upsertRelationship(t1, tn2, mapping1);
        upsertRelationship(t2, tn1, mapping2);
      } catch (error) {
        console.error('Error processing link:', error);
      }
    }

    // Build final tables
    for (const table of Object.values(tableDict)) {
      try {
        if (!table.name || !table.fields) continue;

        result.tables.push({
          [table.name]: {
            fields:
              Array.isArray(table.fields) && table.fields.length > 0
                ? table.fields.map(
                    ({
                      name,
                      type,
                      pk,
                      unique,
                      not_null,
                      increment,
                      secure,
                      note,
                    }) => ({
                      name: name || false,
                      type: type || false,
                      pk: !!pk,
                      unique: !!unique,
                      not_null: !!not_null,
                      increment: !!increment,
                      secure: !!secure,
                      note: note || '',
                    })
                  )
                : false,
            relations: tableRelations[table.id] || [],
            note: table.note || '',
          },
        });
      } catch (error) {
        console.error('Error processing table:', error);
      }
    }
    return result;
  } catch (error) {
    console.error('Transform error:', error);
    return null;
  }
}