import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const exportInboundToPDF = (data: any) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('Mini Warehouse', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Inventory Management System', 105, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Inbound Transaction Detail', 105, 29, { align: 'center' })
  
  // Transaction Info
  doc.setFontSize(10)
  doc.text(`Inbound Number: ${data.inbound_number}`, 14, 40)
  doc.text(`Date: ${data.inbound_date}`, 14, 46)
  doc.text(`Supplier: ${data.supplier}`, 14, 52)
  doc.text(`User: ${data.inbound_user}`, 14, 58)
  
  // Items Table
  const tableData = data.items.map((item: any) => [
    item.part_number,
    item.description,
    item.category_name || '-',
    item.qty
  ])
  
  autoTable(doc, {
    startY: 65,
    head: [['Part Number', 'Description', 'Category', 'Qty']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }
  })
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10)
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
  
  doc.save(`Inbound_${data.inbound_number}.pdf`)
}

export const exportInboundToXLSX = (data: any) => {
  const worksheetData = [
    ['Mini Warehouse - Inventory Management System'],
    ['Inbound Transaction Detail'],
    [],
    ['Inbound Number:', data.inbound_number],
    ['Date:', data.inbound_date],
    ['Supplier:', data.supplier],
    ['User:', data.inbound_user],
    [],
    ['Part Number', 'Description', 'Category', 'Qty'],
    ...data.items.map((item: any) => [
      item.part_number,
      item.description,
      item.category_name || '-',
      item.qty
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inbound')
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 10 }
  ]
  
  XLSX.writeFile(wb, `Inbound_${data.inbound_number}.xlsx`)
}

export const exportOutboundToPDF = (data: any) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('Mini Warehouse', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Inventory Management System', 105, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Outbound Transaction Detail', 105, 29, { align: 'center' })
  
  // Transaction Info
  doc.setFontSize(10)
  doc.text(`Outbound Number: ${data.outbound_number}`, 14, 40)
  doc.text(`Date: ${data.outbound_date}`, 14, 46)
  doc.text(`Destination: ${data.destination}`, 14, 52)
  doc.text(`User: ${data.outbound_user}`, 14, 58)
  
  // Items Table
  const tableData = data.items.map((item: any) => [
    item.part_number,
    item.description,
    item.category_name || '-',
    item.qty
  ])
  
  autoTable(doc, {
    startY: 65,
    head: [['Part Number', 'Description', 'Category', 'Qty']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }
  })
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10)
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
  
  doc.save(`Outbound_${data.outbound_number}.pdf`)
}

export const exportOutboundToXLSX = (data: any) => {
  const worksheetData = [
    ['Mini Warehouse - Inventory Management System'],
    ['Outbound Transaction Detail'],
    [],
    ['Outbound Number:', data.outbound_number],
    ['Date:', data.outbound_date],
    ['Destination:', data.destination],
    ['User:', data.outbound_user],
    [],
    ['Part Number', 'Description', 'Category', 'Qty'],
    ...data.items.map((item: any) => [
      item.part_number,
      item.description,
      item.category_name || '-',
      item.qty
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Outbound')
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 10 }
  ]
  
  XLSX.writeFile(wb, `Outbound_${data.outbound_number}.xlsx`)
}

export const exportStockToPDF = (stockData: any[]) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('Mini Warehouse', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Inventory Management System', 105, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Stock Monitor Report', 105, 29, { align: 'center' })
  
  // Date
  doc.setFontSize(10)
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 40)
  
  // Stock Table
  const tableData = stockData.map((item: any) => [
    item.part_number,
    item.description,
    item.category_name || '-',
    item.total_inbound || 0,
    item.total_outbound || 0,
    item.current_stock || 0
  ])
  
  autoTable(doc, {
    startY: 50,
    head: [['Part Number', 'Description', 'Category', 'Total In', 'Total Out', 'Stock']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }
  })
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10)
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
  
  doc.save(`Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const exportStockToXLSX = (stockData: any[]) => {
  const worksheetData = [
    ['Mini Warehouse - Inventory Management System'],
    ['Stock Monitor Report'],
    ['Report Date:', new Date().toLocaleDateString()],
    [],
    ['Part Number', 'Description', 'Category', 'Total Inbound', 'Total Outbound', 'Current Stock'],
    ...stockData.map((item: any) => [
      item.part_number,
      item.description,
      item.category_name || '-',
      item.total_inbound || 0,
      item.total_outbound || 0,
      item.current_stock || 0
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Report')
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 }
  ]
  
  XLSX.writeFile(wb, `Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export const exportPartHistoryToPDF = (partData: any, transactions: any[]) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.text('Mini Warehouse', 105, 15, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Inventory Management System', 105, 22, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Part Transaction History', 105, 29, { align: 'center' })
  
  // Part Info
  doc.setFontSize(10)
  doc.text(`Part Number: ${partData.part_number}`, 14, 40)
  doc.text(`Description: ${partData.description}`, 14, 46)
  doc.text(`Category: ${partData.category_name || '-'}`, 14, 52)
  
  // Transactions Table
  const tableData = transactions.map((txn: any) => [
    txn.transaction_number,
    txn.date,
    txn.type,
    txn.reference,
    txn.debit || '-',
    txn.credit || '-',
    txn.balance
  ])
  
  autoTable(doc, {
    startY: 60,
    head: [['Txn #', 'Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 }
    }
  })
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10)
  doc.text(`Page ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
  
  doc.save(`Part_History_${partData.part_number}.pdf`)
}

export const exportPartHistoryToXLSX = (partData: any, transactions: any[]) => {
  const worksheetData = [
    ['Mini Warehouse - Inventory Management System'],
    ['Part Transaction History'],
    [],
    ['Part Number:', partData.part_number],
    ['Description:', partData.description],
    ['Category:', partData.category_name || '-'],
    [],
    ['Transaction #', 'Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'],
    ...transactions.map((txn: any) => [
      txn.transaction_number,
      txn.date,
      txn.type,
      txn.reference,
      txn.debit || '-',
      txn.credit || '-',
      txn.balance
    ])
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Part History')
  
  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 }
  ]
  
  XLSX.writeFile(wb, `Part_History_${partData.part_number}.xlsx`)
}
