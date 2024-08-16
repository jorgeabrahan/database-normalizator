# Database Normalization

## Column Naming Conventions for Normalization Program

To effectively use the normalization program, it is essential to follow specific naming conventions for the columns in your tables. This ensures that the program can correctly identify primary keys, foreign keys, and columns with partial or transitive dependencies.

### Naming Conventions

#### Primary Key

- Syntax: column_name|pk
- Description: Indicates that the column is a primary key.
- Example: id_orden|pk

#### Foreign Key

- Syntax: column_name|fk
- Description: Indicates that the column is a foreign key.
- Example: id_orden|fk

#### Partial Dependency

- Syntax: column_name\DP_rel-n
- Description: Indicates that the column has a partial dependency. The n represents the relation number.
- Example: id_cliente\DP_rel-1

#### Transitive Dependency

- Syntax: T_column_name\DP_rel-n
- Description: Indicates that the column has a transitive dependency. The n represents the relation number.
- Example: T_ciudad\DP_rel-1

#### Non-Atomic Columns

- Syntax: column_name\NA_rel-n
- Description: Indicates that the column contains non-atomic values. The n represents the relation number.
- Example: departamentos\NA_rel-1

### Examples of Tables

#### Example 1: Orders Table

| id_orden\|pk | fecha | id_cliente\DP_rel-1[pk] | nom_cliente\DP_rel-1 | ciudad\DP_rel-1 | id_art\DP_rel-2[pk] | nom_art\DP_rel-2 | cant | precio\DP_rel-2 |
| -------- | ----- | ----------------------- | ------------------- | ----------------- | -------------------- | --------------- | ---- | --------------- |
| 2301     | 23/02/11 | 101 | Martin | Riobamba | 3786 | Red | 3 | 35 |
| 2301     | 23/02/11 | 101 | Martin | Riobamba | 4011 | Raqueta | 6 | 65 |
| 2301     | 23/02/11 | 101 | Martin | Riobamba | 9132 | Paq-3 | 8 | 4.75 |
| 2302     | 25/02/11 | 107 | Herman | Ambato | 5794 | Paq-6 | 4 | 5 |
| 2303     | 27/02/11 | 110 | Pedro | Quito | 4011 | Raqueta | 2 | 65 |
| 2303     | 27/02/11 | 110 | Pedro | Quito | 3141 | Funda | 2 | 10 |

#### Example 2: Employees Table

| id_empleado\|pk | nombre | T_ciudad\DP_rel-1 | departamentos\NA_rel-1 | horas\NA_rel-2 | proyectos\NA_rel-2 |
| -------- | ----- | ----------------------- | ------------------- | ----------------- | -------------------- |
| 62211062 | Jorge | T_Riobamba | 6; 4 | 10; 15 | 3; 2 |  |

#### Example 3: Products Table

| id_producto\|pk | nombre | categoria\DP_rel-1 | precio | T_proveedor\DP_rel-2 | T_ciudad\DP_rel-2 |
| -------- | ----- | ----------------------- | ------ | -------------------- | -------------------- |
| 1001     | Laptop | Electronica | 1200 | Proveedor1 | Ciudad1 |
| 1002     | Mouse | Electronica | 20 | Proveedor2 | Ciudad2 |

### CSV File Structure

- The table (or tables) should be created in a single CSV file.
- The first table should start at column A and row 1.
- If there are more tables, each subsequent table should start from column A and in row n + 2 where n is the row number in which the previous table ended.
  - For instance, if the first table goes from A1 to D6, then the next table should start from row 8 (6 + 2).
  - If the next table has 4 columns and 5 rows, it would go from A8 to D13.

### Notes

- Ensure that each table has a primary key column.
- Use the \DP_rel-n suffix for columns with partial dependencies.
- Use the T_ prefix and \DP_rel-n suffix for columns with transitive dependencies.
- Use the \NA_rel-n suffix for columns with non-atomic values.
- Avoid duplicate rows by ensuring that each primary key value is unique within the table.

By following these naming conventions, you can ensure that the normalization program correctly processes your tables and converts them to the desired normal form.
