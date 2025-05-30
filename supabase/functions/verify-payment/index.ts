
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { payment_id, order_id, signature, customer_details } = await req.json()

    if (!payment_id || !order_id || !signature || !customer_details) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify Razorpay signature
    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${order_id}|${payment_id}`)
      )
    ).then(signature => 
      Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    )

    if (expectedSignature !== signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get payment details from Razorpay
    const auth = btoa(`${Deno.env.get('RAZORPAY_KEY_ID')}:${razorpayKeySecret}`)
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })

    if (!paymentResponse.ok) {
      throw new Error('Failed to fetch payment details')
    }

    const paymentData = await paymentResponse.json()

    if (paymentData.status !== 'captured') {
      return new Response(
        JSON.stringify({ error: 'Payment not captured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        payment_method: paymentData.method
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        customer_details: customer_details 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Payment verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
