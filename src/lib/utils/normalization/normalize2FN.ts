import type { ArrayOfTablesType, TableType } from "../../types";

const isPkRepeated = (table: TableType) => {
  const rowsPkSet = new Set();
  const firstRow = table[0];
  const pkIndex = firstRow.findIndex((col) => col.includes("|pk"));
  for (const rowIndex in table) {
    const row = table[rowIndex];
    if (parseInt(rowIndex) === 0) continue;
    if (rowsPkSet.has(row[pkIndex])) return true;
    rowsPkSet.add(row[pkIndex]);
  }
  return false;
};

const groupRowsByPk = (table: TableType) => {
  const rowsPkSet = new Set();
  const firstRow = table[0];
  const pkIndex = firstRow.findIndex((col) => col.includes("|pk"));
  const groupedRows: TableType[] = [];
  let tempTable: TableType = [];
  const addRowToTempTable = (row: string[], rowIndex: number) => {
    tempTable.push(row);
    if (rowIndex === table.length - 1) groupedRows.push(tempTable);
  };
  for (const rowIndex in table) {
    // skip header row
    if (parseInt(rowIndex) === 0) continue;
    const row = table[rowIndex];
    const pkValue = row[pkIndex];
    if (rowsPkSet.has(pkValue)) {
      addRowToTempTable(row, parseInt(rowIndex));
      continue;
    }
    if (tempTable.length > 0) groupedRows.push(tempTable);
    rowsPkSet.add(pkValue);
    tempTable = [];
    addRowToTempTable(row, parseInt(rowIndex));
  }
  return groupedRows;
};

const identifyColumnsCausingPkToRepeat = (table: TableType) => {
  const columnIndexesCausingPkToRepeat: Set<number> = new Set();
  const groupedRows = groupRowsByPk(table);
  for (const group of groupedRows) {
    // groups with only one row won't help identify columns causing pk to repeat
    if (group.length === 1) continue;
    // const repeatingColumnsIndexes
    for (const rowIndex in group) {
      if (parseInt(rowIndex) === 0) continue;
      const row = group[rowIndex];
      const prevRow = group[parseInt(rowIndex) - 1];
      for (let index = 0; index < row.length; index++) {
        if (row[index] === prevRow[index]) continue;
        columnIndexesCausingPkToRepeat.add(index);
      }
    }
  }
  return Array.from(columnIndexesCausingPkToRepeat);
};

const removeColumnsFromTable = (
  table: TableType,
  columnsToRemove: number[],
) => {
  const tableWithoutColumnsToRemove = table.map((row: string[]) =>
    row.filter((_, index) => !columnsToRemove.includes(index)),
  );
  return tableWithoutColumnsToRemove;
};

const removeDuplicateRows = (table: TableType): TableType => {
  const tableWithoutDuplicateRows: TableType = [];
  for (const rowIndex in table) {
    if (parseInt(rowIndex) === 0) {
      tableWithoutDuplicateRows.push(table[rowIndex]);
      continue;
    }
    const row = table[rowIndex];
    const pkValue = row[0];
    const existingRowIndex = tableWithoutDuplicateRows.findIndex(
      (r) => r[0] === pkValue,
    );

    if (existingRowIndex === -1) {
      tableWithoutDuplicateRows.push(row);
      continue;
    }
    const existingRow = tableWithoutDuplicateRows[existingRowIndex];
    let isDuplicate = true;
    for (let colIndex = 1; colIndex < row.length; colIndex++) {
      if (row[colIndex] !== existingRow[colIndex]) {
        isDuplicate = false;
        break;
      }
    }
    if (!isDuplicate) {
      tableWithoutDuplicateRows.push(row);
    }
  }
  return tableWithoutDuplicateRows;
};

const segregateRepeatingColumnsFromTable = (
  table: TableType,
  columnsCausingPkToRepeat: number[],
) => {
  const segregatedTable: TableType = [];
  const firstRow = table[0];
  const pkIndex = firstRow.findIndex((col) => col.includes("|pk"));
  for (const rowIndex in table) {
    const row = table[rowIndex];
    if (parseInt(rowIndex) === 0) {
      const segregatedTableHeaderRow = [
        "id|pk",
        row[pkIndex].replace("|pk", "|fk"),
      ];
      for (const colIndex of columnsCausingPkToRepeat) {
        segregatedTableHeaderRow.push(firstRow[colIndex].trim());
      }
      segregatedTable.push(segregatedTableHeaderRow);
      continue;
    }
    const newRow = [crypto.randomUUID(), row[pkIndex]];
    for (const colIndex of columnsCausingPkToRepeat) {
      newRow.push(row[colIndex]);
    }
    segregatedTable.push(newRow);
  }
  return segregatedTable;
};

const segregateMainTable = (mainTable: TableType) => {
  if (!isPkRepeated(mainTable)) return { mainTable, segregatedTable: [] };
  const columnsCausingPkToRepeat = identifyColumnsCausingPkToRepeat(mainTable);
  const mainTableWithoutColumnsCausingPkToRepeat = removeColumnsFromTable(
    mainTable,
    columnsCausingPkToRepeat,
  );
  const segregatedMainTable = removeDuplicateRows(
    mainTableWithoutColumnsCausingPkToRepeat,
  );
  const segregatedTable = segregateRepeatingColumnsFromTable(
    mainTable,
    columnsCausingPkToRepeat,
  );
  return {
    mainTable: segregatedMainTable,
    segregatedTable: segregatedTable,
  };
};

export const normalize2FN = (
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

  const DPColumns: { name: string; index: number; relationNumber: number }[] =
    [];
  for (const rowIndex in headerRow) {
    const column = headerRow[rowIndex];
    if (!column.includes("\\DP")) continue;
    let match = column.match(/DP_rel-(\d+)/);
    const relationNumber = match ? parseInt(match[1]) : 0;
    const columnName = column.replace(/\\DP_rel-\d+/, "");
    DPColumns.push({
      name: columnName,
      index: parseInt(rowIndex),
      relationNumber,
    });
  }

  const groupedDPColumns = DPColumns.reduce(
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
  // iterate over each group of dependent primary columns
  for (const relationNumber in groupedDPColumns) {
    const segregatedTable: string[][] = [];
    const segregatedTablePkColumnIndex = groupedDPColumns[
      relationNumber
    ].findIndex((col) => col.name.includes("[pk]"));
    const hasPkColumn = segregatedTablePkColumnIndex !== -1;
    // iterate over each row of the original table
    for (const tableRowIndex in table) {
      // create segregated table header row
      if (parseInt(tableRowIndex) === 0) {
        const segregatedTableHeaderRow = [
          hasPkColumn
            ? groupedDPColumns[relationNumber][
                segregatedTablePkColumnIndex
              ].name.replace("[pk]", "|pk")
            : "id|pk",
          pk.name.replace("|pk", "|fk"),
        ];
        for (const col of groupedDPColumns[relationNumber]) {
          if (col.name.includes("[pk]")) continue;
          segregatedTableHeaderRow.push(col.name.trim());
        }
        segregatedTable.push(segregatedTableHeaderRow);
        continue;
      }
      const row = table[tableRowIndex];

      const newRow = [
        hasPkColumn
          ? row[
              groupedDPColumns[relationNumber][segregatedTablePkColumnIndex]
                .index
            ]
          : crypto.randomUUID(),
        row[pk.index],
      ];
      for (const col of groupedDPColumns[relationNumber]) {
        if (col.name.includes("[pk]")) continue;
        newRow.push(row[col.index]);
      }
      segregatedTable.push(newRow);
    }
    segregatedTables.push(removeDuplicateRows(segregatedTable));
  }

  const indexesToRemove = DPColumns.map((col) => col.index);
  indexesToRemove.sort((a, b) => b - a);
  const normalizedMainTable = table.map((row: string[]) =>
    row.filter((_, index) => !indexesToRemove.includes(index)),
  );
  const { mainTable, segregatedTable } =
    segregateMainTable(normalizedMainTable);
  onSuccessCallback([mainTable, ...segregatedTables, segregatedTable]);
};
