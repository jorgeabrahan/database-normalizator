import type { TableType } from "../types";

export const createTableToRender = (table: TableType): HTMLDivElement => {
  const tableScrollableWrapper = document.createElement('div');
  tableScrollableWrapper.classList.add('overflow-x-scroll');
  const tableElement = document.createElement('table');
  tableScrollableWrapper.appendChild(tableElement);

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const tableHeaderRow = table[0];
  tableHeaderRow.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  const tbody = document.createElement('tbody');
  const tableWithoutHeaderRow = table.slice(1);
  tableWithoutHeaderRow.forEach(row => {
    const tr = document.createElement('tr');
    row.forEach(column => {
      const td = document.createElement('td');
      td.textContent = column;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tableElement.appendChild(tbody);

  return tableScrollableWrapper;
}
