'use client'

import { useState, useEffect } from 'react'
import { parquetRead } from 'hyparquet'

export interface DataLoaderProps {
  filePath: string
  onDataLoaded: (data: any[]) => void
  onError?: (error: Error) => void
}

export const useParquetData = (filePath: string) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch(filePath)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const rows: any[] = []

        // Read parquet file with hyparquet
        await parquetRead({
          file: arrayBuffer,
          onComplete: (dataArray) => {
            // hyparquet returns column-oriented data
            // dataArray is an array where each element is a column
            if (!dataArray || dataArray.length === 0) {
              setData([])
              setError(null)
              return
            }

            // Get the number of rows from the first column
            const numRows = dataArray[0]?.length ?? 0
            const numCols = dataArray.length

            // Convert from column-oriented to row-oriented
            for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
              const row: any = {}
              for (let colIdx = 0; colIdx < numCols; colIdx++) {
                // The column name should be in the metadata
                // For now, we'll use the column index or get from schema
                row[`col_${colIdx}`] = dataArray[colIdx]?.[rowIdx]
              }
              rows.push(row)
            }

            setData(rows)
            setError(null)
          },
        })
      } catch (err) {
        setError(err as Error)
        console.error('Error loading parquet data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filePath])

  return { data, loading, error }
}

// Alternative implementation with better schema handling
export const useParquetDataWithSchema = (filePath: string) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [schema, setSchema] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch(filePath)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const rows: any[] = []

        interface ParquetColumnSchema {
          name: string
          type?: string
          [key: string]: any
        }

        interface ParquetMetadata {
          schema?: ParquetColumnSchema[]
          [key: string]: any
        }

        interface ParquetReadOptions {
          file: ArrayBuffer
          onComplete: (dataArray: any[][], metadata?: ParquetMetadata) => void
        }

        await parquetRead({
          file: arrayBuffer,
          onComplete: (dataArray: any[][], metadata?: ParquetMetadata) => {
            // Get column names from metadata/schema
            const columnNames =
              metadata?.schema?.map((col: ParquetColumnSchema) => col.name) ||
              []

            if (!dataArray || dataArray.length === 0) {
              setData([])
              setSchema(metadata)
              setError(null)
              return
            }

            const numRows = dataArray[0]?.length ?? 0

            // Convert column-oriented data to row-oriented with proper column names
            for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
              const row: Record<string, any> = {}
              dataArray.forEach((column: any[], colIdx: number) => {
                const colName = columnNames[colIdx] || `column_${colIdx}`
                row[colName] = column[rowIdx]
              })
              rows.push(row)
            }

            setData(rows)
            setSchema(metadata)
            setError(null)
          },
        } as ParquetReadOptions)
      } catch (err) {
        setError(err as Error)
        console.error('Error loading parquet data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filePath])

  return { data, loading, error, schema }
}
