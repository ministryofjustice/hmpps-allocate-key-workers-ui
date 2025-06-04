import { Response } from 'express'

export const setPaginationLocals = (
  res: Response,
  pageSize: number,
  currentPage: number,
  totalRows: number,
  rowCount: number,
  hrefTemplate = '?page={page}',
  localKey: string = 'paginationParams',
) => {
  const rowFrom = pageSize * (currentPage - 1) + 1
  const rowTo = rowFrom + rowCount - 1

  res.locals[localKey] = {
    totalPages: Math.ceil(totalRows / pageSize),
    currentPage,
    rowFrom,
    rowTo,
    totalRows,
    hrefTemplate,
  }
}
