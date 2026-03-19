/**
 * CSV Parser Service
 * Handles CSV parsing and generation
 */

export interface CsvParseOptions {
  delimiter?: string
  skipEmptyLines?: boolean
  trimValues?: boolean
  headers?: boolean
}

export interface CsvGenerateOptions {
  delimiter?: string
  includeHeaders?: boolean
  fields?: string[]
  newline?: '\n' | '\r\n'
}

class CsvParser {
  /**
   * Parse CSV string to array of objects
   */
  parse(csvContent: string, options: CsvParseOptions = {}): any[] {
    const {
      delimiter = ',',
      skipEmptyLines = true,
      trimValues = true,
      headers = true
    } = options

    const lines = csvContent.split(/\r?\n/)
    const result: any[] = []

    if (lines.length === 0) return result

    let headerRow: string[] = []
    let startIndex = 0

    if (headers) {
      headerRow = this.parseLine(lines[0], delimiter, trimValues)
      startIndex = 1
    } else {
      // Generate default headers (col_0, col_1, etc.)
      const firstLine = this.parseLine(lines[0], delimiter, trimValues)
      headerRow = firstLine.map((_, i) => `col_${i}`)
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()

      if (skipEmptyLines && !line) continue

      const values = this.parseLine(line, delimiter, trimValues)

      if (values.length === 0 && skipEmptyLines) continue

      const row: any = {}
      headerRow.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index] : ''
      })

      result.push(row)
    }

    return result
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseLine(line: string, delimiter: string, trimValues: boolean): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i++
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        // Field delimiter
        result.push(trimValues ? current.trim() : current)
        current = ''
      } else {
        current += char
      }
    }

    // Add last field
    result.push(trimValues ? current.trim() : current)

    return result
  }

  /**
   * Generate CSV string from array of objects
   */
  generate(data: any[], options: CsvGenerateOptions = {}): string {
    const {
      delimiter = ',',
      includeHeaders = true,
      fields,
      newline = '\n'
    } = options

    if (data.length === 0) return ''

    // Determine fields
    const fieldList = fields || Object.keys(data[0])

    const lines: string[] = []

    // Add headers
    if (includeHeaders) {
      lines.push(this.generateLine(fieldList, delimiter))
    }

    // Add data rows
    data.forEach(item => {
      const values = fieldList.map(field => {
        const value = this.getNestedValue(item, field)
        return this.formatValue(value)
      })
      lines.push(this.generateLine(values, delimiter))
    })

    return lines.join(newline)
  }

  /**
   * Generate a single CSV line with proper escaping
   */
  private generateLine(values: string[], delimiter: string): string {
    return values.map(value => this.escapeValue(String(value), delimiter)).join(delimiter)
  }

  /**
   * Escape CSV value
   */
  private escapeValue(value: string, delimiter: string): string {
    // Check if value needs quoting
    const needsQuoting = value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')

    if (needsQuoting) {
      // Escape quotes by doubling them
      const escaped = value.replace(/"/g, '""')
      return `"${escaped}"`
    }

    return value
  }

  /**
   * Format value for CSV
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Parse CSV file from File object
   */
  async parseFile(file: File, options?: CsvParseOptions): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = this.parse(content, options)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))

      reader.readAsText(file)
    })
  }

  /**
   * Download CSV as file
   */
  downloadCsv(data: any[], filename: string, options?: CsvGenerateOptions): void {
    const csv = this.generate(data, options)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Validate CSV structure
   */
  validate(data: any[], requiredFields: string[]): Array<{ row: number; field: string; error: string }> {
    const errors: Array<{ row: number; field: string; error: string }> = []

    data.forEach((item, index) => {
      const row = index + 1

      requiredFields.forEach(field => {
        if (!item[field] || String(item[field]).trim() === '') {
          errors.push({
            row,
            field,
            error: `Field '${field}' is required`
          })
        }
      })
    })

    return errors
  }

  /**
   * Convert CSV to template with example data
   */
  generateTemplate(fields: Array<{ name: string; example: string; description?: string }>): string {
    const headers = fields.map(f => f.name)
    const examples = fields.map(f => f.example)
    const descriptions = fields.map(f => f.description || '')

    const lines: string[] = []
    lines.push(this.generateLine(headers, ','))
    lines.push(this.generateLine(examples, ','))

    if (descriptions.some(d => d)) {
      lines.push(`# ${descriptions.join(' | ')}`)
    }

    return lines.join('\n')
  }
}

export const csvParser = new CsvParser()
