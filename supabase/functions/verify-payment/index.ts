
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Handle webhook from Razorpay
    if (req.headers.get('x-razorpay-signature')) {
      console.log('Processing Razorpay webhook')
      
      const body = await req.text()
      const signature = req.headers.get('x-razorpay-signature')!
      
      // Verify webhook signature
      const crypto = await import('node:crypto')
      const expectedSignature = crypto
        .createHmac('sha256', razorpayWebhookSecret)
        .update(body)
        .digest('hex')
      
      if (expectedSignature !== signature) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const webhookData = JSON.parse(body)
      console.log('Webhook event:', webhookData.event)
      
      if (webhookData.event === 'payment.captured') {
        const payment = webhookData.payload.payment.entity
        console.log('Payment captured:', payment.id)
        
        // Update payment record
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('razorpay_payment_id', payment.id)
        
        if (updateError) {
          console.error('Failed to update payment:', updateError)
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle direct payment verification (existing functionality)
    const { payment_id, order_id, signature, customer_details } = await req.json()

    if (!payment_id || !order_id || !signature) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment verification fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify payment signature
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    const crypto = await import('node:crypto')
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(order_id + '|' + payment_id)
      .digest('hex')

    if (expectedSignature !== signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find existing user by email or create new one
    let userId = null
    
    if (customer_details?.email) {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(customer_details.email)
      
      if (existingUser.user) {
        userId = existingUser.user.id
      } else {
        // Create new user account
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customer_details.email,
          password: Math.random().toString(36).slice(-8), // Temporary password
          email_confirm: true,
          user_metadata: {
            name: customer_details.name || '',
            phone: customer_details.phone || ''
          }
        })

        if (createError) {
          console.error('Error creating user:', createError)
          return new Response(
            JSON.stringify({ error: 'Failed to create user account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        userId = newUser.user?.id
      }
    }

    // Store payment record with user_id
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        razorpay_payment_id: payment_id,
        razorpay_order_id: order_id,
        status: 'completed',
        amount: 7000,
        currency: 'INR',
        payment_method: 'razorpay',
        user_id: userId
      })

    if (paymentError) {
      console.error('Payment storage error:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Failed to store payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update user profile to mark payment as verified
    if (userId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: customer_details?.email,
          payment_verified: true,
          subscription_status: 'active'
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully' 
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
