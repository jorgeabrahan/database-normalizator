import type { ArrayOfTablesType, TableType } from "../../types";

export const normalize3FN = (
  table: TableType,
  tableNumber: number,
  onSuccessCallback: (normalizedTables: ArrayOfTablesType) => void,
  onErrorCallback: (errorMessage: string) => void,
): void => {
  const headerRow = table[0];
  const pkColumnIndex = headerRow.findIndex((col: string) =>
    col.includes("|pk"),
  );
  if (pkColumnIndex === -1) {
    onErrorCallback(`Table ${tableNumber} does not have a primary key`);
    return;
  }
  const pk = {
    name: headerRow[pkColumnIndex],
    index: pkColumnIndex,
  };

  const transitiveColumns: {
    name: string;
    index: number;
    relationNumber: number;
  }[] = [];
  for (const rowIndex in headerRow) {
    const column = headerRow[rowIndex];
    if (!column.startsWith("T_")) continue;
    let match = column.match(/T_(.*)\\DP_rel-(\d+)/);
    const relationNumber = match ? parseInt(match[2]) : 0;
    const columnName = column.replace(/T_(.*)\\DP_rel-\d+/, "$1");
    transitiveColumns.push({
      name: columnName,
      index: parseInt(rowIndex),
      relationNumber,
    });
  }

  const groupedTransitiveColumns = transitiveColumns.reduce(
    (acc, column) => {
      const { relationNumber } = column;
      if (!acc[relationNumber]) {
        acc[relationNumber] = [];
      }
      acc[relationNumber].push(column);
      return acc;
    },
    {} as {
      [key: number]: { name: string; index: number; relationNumber: number }[];
    },
  );

  const segregatedTables: ArrayOfTablesType = [];
  for (const relationNumber in groupedTransitiveColumns) {
    const segregatedTable: string[][] = [];
    for (const tableRowIndex in table) {
      if (parseInt(tableRowIndex) === 0) {
        const segregatedTableHeaderRow = [
          "id|pk",
          pk.name.replace("|pk", "|fk"),
        ];
        groupedTransitiveColumns[relationNumber].forEach((col) => {
          segregatedTableHeaderRow.push(col.name.trim());
        });
        segregatedTable.push(segregatedTableHeaderRow);
        continue;
      }
      const row = table[tableRowIndex];

      const newRow: string[] = [crypto.randomUUID(), row[pk.index]];
      groupedTransitiveColumns[relationNumber].forEach((col) => {
        newRow.push(row[col.index]);
      });
      segregatedTable.push(newRow);
    }
    segregatedTables.push(segregatedTable);
  }

  const indexesToRemove = transitiveColumns.map((col) => col.index);
  indexesToRemove.sort((a, b) => b - a);
  const normalizedMainTable = table.map((row: string[]) =>
    row.filter((_, index) => !indexesToRemove.includes(index)),
  );

  onSuccessCallback([normalizedMainTable, ...segregatedTables]);
};
