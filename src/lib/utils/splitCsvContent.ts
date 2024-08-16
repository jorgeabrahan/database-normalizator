export const splitCsvContent = (content: string) => {
  const rows = content.split('\r\n');
  const removeEmptyColumns = (row: string[]) => row.filter(Boolean);
  const splitTables = (rows: string[][]) => {
    const tables: string[][][] = [];
    let table: string[][] = [];
    for (const rowIndex in rows) {
      const row = rows[rowIndex];
      if (row.length === 0 || Number(rowIndex) === rows.length - 1) {
        table.push(row);
        tables.push(table);
        table = [];
        continue;
      }
      table.push(row);
    }
    return tables;
  }
  return splitTables(rows.map(row => removeEmptyColumns(row.split(','))));
}
