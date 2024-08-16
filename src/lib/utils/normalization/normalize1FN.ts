import type { ArrayOfTablesType, TableType } from "../../types";

export const normalize1FN = (
  table: TableType,
  tableNumber: number,
  onSuccessCallback: (normalizedTables: ArrayOfTablesType) => void,
  onErrorCallback: (errorMessage: string) => void,
): void => {
  const headerRow = table[0];
  // Identify primary key (pk)
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

  // Identify non-atomic columns (NA)
  const NAColumns: { name: string; index: number; relationNumber: number }[] =
    [];
  for (const rowIndex in headerRow) {
    const column = headerRow[rowIndex];
    if (!column.includes("\\NA")) continue;
    // if column is non-atomic
    // match the pattern "NA_rel-n" in the column name
    let match = column.match(/NA_rel-(\d+)/);
    // extract the non-atomic column relation number
    const relationNumber = match ? parseInt(match[1]) : 0;
    // remove the "NA_rel-n" pattern from the column name
    const columnName = column.replace(/\\NA_rel-\d+/, "");
    NAColumns.push({
      name: columnName,
      index: parseInt(rowIndex),
      relationNumber,
    });
  }

  // group non-atomic columns by relation number
  const groupedNAColumns = NAColumns.reduce(
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
  // iterate over each group of non-atomic columns
  for (const relationNumber in groupedNAColumns) {
    const segregatedTable: string[][] = [];
    // iterate over each row of the original table
    for (const tableRowIndex in table) {
      // create segregated table header row
      if (parseInt(tableRowIndex) === 0) {
        const segregatedTableHeaderRow = [
          "id|pk",
          pk.name.replace("|pk", "|fk"),
        ];
        groupedNAColumns[relationNumber].forEach((col) => {
          segregatedTableHeaderRow.push(col.name.trim());
        });
        segregatedTable.push(segregatedTableHeaderRow);
        continue;
      }
      const row = table[tableRowIndex];

      // create segregated table rows for each grouped NA columns
      const groupedNAColumnsRow: { [index: number]: string[] } = {};
      groupedNAColumns[relationNumber].forEach((col) => {
        const atomicValues = row[col.index]
          .split(";")
          .map((v: string) => v.trim());
        atomicValues.forEach((av: string, index: number) => {
          groupedNAColumnsRow[index] = !groupedNAColumnsRow[index]
            ? [av]
            : [...groupedNAColumnsRow[index], av];
        });
      });
      Object.values(groupedNAColumnsRow).forEach((r: string[]) => {
        segregatedTable.push([crypto.randomUUID(), row[pk.index], ...r]);
      });
    }
    segregatedTables.push(segregatedTable);
  }

  const indexesToRemove = NAColumns.map((col) => col.index);
  indexesToRemove.sort((a, b) => b - a);
  // restructure main table to remove non-atomic columns
  const normalizedMainTable = table.map((row: string[]) =>
    row.filter((_, index) => !indexesToRemove.includes(index)),
  );
  // call on success with main table and segregated tables
  onSuccessCallback([normalizedMainTable, ...segregatedTables])
};
