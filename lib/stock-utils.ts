import { SupabaseClient } from '@supabase/supabase-js'

export const getPartStock = async (supabase: SupabaseClient, partId: string): Promise<number> => {
  try {
    // Get total inbound
    const { data: inboundData, error: inboundError } = await supabase
      .from('inbound_details')
      .select('qty')
      .eq('part_id', partId)

    if (inboundError) throw inboundError

    const totalInbound = inboundData?.reduce((sum, item) => sum + item.qty, 0) || 0

    // Get total outbound
    const { data: outboundData, error: outboundError } = await supabase
      .from('outbound_details')
      .select('qty')
      .eq('part_id', partId)

    if (outboundError) throw outboundError

    const totalOutbound = outboundData?.reduce((sum, item) => sum + item.qty, 0) || 0

    return totalInbound - totalOutbound
  } catch (error) {
    console.error('Error getting part stock:', error)
    return 0
  }
}

export const getAvailableParts = async (supabase: SupabaseClient) => {
  try {
    // Get all parts with categories
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*, categories(category_name)')
      .order('part_number')

    if (partsError) throw partsError

    // Calculate stock for each part
    const partsWithStock = await Promise.all(
      (parts || []).map(async (part: any) => {
        const stock = await getPartStock(supabase, part.id)
        return {
          id: part.id,
          part_number: part.part_number,
          description: part.description,
          category_id: part.category_id,
          category_name: part.categories?.category_name || null,
          current_stock: stock
        }
      })
    )

    // Filter only parts with stock > 0
    return partsWithStock.filter(part => part.current_stock > 0)
  } catch (error) {
    console.error('Error getting available parts:', error)
    return []
  }
}

export const validateOutboundQty = async (
  supabase: SupabaseClient,
  partId: string,
  requestedQty: number
): Promise<{ valid: boolean; availableQty: number; message?: string }> => {
  try {
    const availableQty = await getPartStock(supabase, partId)

    if (requestedQty <= 0) {
      return {
        valid: false,
        availableQty,
        message: 'Quantity must be greater than 0'
      }
    }

    if (requestedQty > availableQty) {
      return {
        valid: false,
        availableQty,
        message: `Insufficient stock. Available: ${availableQty}, Requested: ${requestedQty}`
      }
    }

    return {
      valid: true,
      availableQty
    }
  } catch (error) {
    console.error('Error validating outbound qty:', error)
    return {
      valid: false,
      availableQty: 0,
      message: 'Error validating stock'
    }
  }
}

export const getAllPartsWithStock = async (supabase: SupabaseClient) => {
  try {
    // Get all parts with categories
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*, categories(category_name)')
      .order('part_number')

    if (partsError) throw partsError

    // Calculate stock for each part
    const partsWithStock = await Promise.all(
      (parts || []).map(async (part: any) => {
        // Get inbound total
        const { data: inboundData } = await supabase
          .from('inbound_details')
          .select('qty')
          .eq('part_id', part.id)

        const totalInbound = inboundData?.reduce((sum, item) => sum + item.qty, 0) || 0

        // Get outbound total
        const { data: outboundData } = await supabase
          .from('outbound_details')
          .select('qty')
          .eq('part_id', part.id)

        const totalOutbound = outboundData?.reduce((sum, item) => sum + item.qty, 0) || 0

        return {
          id: part.id,
          part_number: part.part_number,
          description: part.description,
          category_id: part.category_id,
          category_name: part.categories?.category_name || null,
          total_inbound: totalInbound,
          total_outbound: totalOutbound,
          current_stock: totalInbound - totalOutbound
        }
      })
    )

    return partsWithStock
  } catch (error) {
    console.error('Error getting all parts with stock:', error)
    return []
  }
}

export const getPartTransactionHistory = async (supabase: SupabaseClient, partId: string) => {
  try {
    // Get inbound transactions
    const { data: inboundData, error: inboundError } = await supabase
      .from('inbound_details')
      .select(`
        qty,
        created_at,
        inbound_headers (
          inbound_number,
          inbound_date,
          supplier
        )
      `)
      .eq('part_id', partId)

    if (inboundError) throw inboundError

    // Get outbound transactions
    const { data: outboundData, error: outboundError } = await supabase
      .from('outbound_details')
      .select(`
        qty,
        created_at,
        outbound_headers (
          outbound_number,
          outbound_date,
          destination
        )
      `)
      .eq('part_id', partId)

    if (outboundError) throw outboundError

    // Helper function to format date to dd-mm-yyyy
    const formatDateToDDMMYYYY = (dateString: string): string => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${day}-${month}-${year}`
    }

    // Format inbound transactions
    const inboundTransactions = (inboundData || []).map((item: any) => ({
      transaction_number: item.inbound_headers?.inbound_number || '',
      date: formatDateToDDMMYYYY(item.inbound_headers?.inbound_date || ''),
      type: 'Inbound',
      reference: item.inbound_headers?.supplier || '',
      debit: null,
      credit: item.qty,
      created_at: item.created_at
    }))

    // Format outbound transactions
    const outboundTransactions = (outboundData || []).map((item: any) => ({
      transaction_number: item.outbound_headers?.outbound_number || '',
      date: formatDateToDDMMYYYY(item.outbound_headers?.outbound_date || ''),
      type: 'Outbound',
      reference: item.outbound_headers?.destination || '',
      debit: item.qty,
      credit: null,
      created_at: item.created_at
    }))

    // Combine and sort by date
    const allTransactions = [...inboundTransactions, ...outboundTransactions]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Calculate running balance
    let balance = 0
    const transactionsWithBalance = allTransactions.map(txn => {
      if (txn.credit) {
        balance += txn.credit
      }
      if (txn.debit) {
        balance -= txn.debit
      }
      return {
        ...txn,
        balance
      }
    })

    return transactionsWithBalance
  } catch (error) {
    console.error('Error getting part transaction history:', error)
    return []
  }
}
