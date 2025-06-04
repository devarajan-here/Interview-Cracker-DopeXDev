
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  console.log('=== Payment Verification Function Called ===')
  console.log('Method:', req.method)
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Handle webhook from Razorpay
    if (req.headers.get('x-razorpay-signature')) {
      console.log('=== Processing Razorpay Webhook ===')
      
      const body = await req.text()
      const signature = req.headers.get('x-razorpay-signature')!
      
      console.log('Webhook body length:', body.length)
      console.log('Webhook signature:', signature.substring(0, 20) + '...')
      
      // Verify webhook signature
      const crypto = await import('node:crypto')
      const expectedSignature = crypto
        .createHmac('sha256', razorpayWebhookSecret)
        .update(body)
        .digest('hex')
      
      console.log('Expected signature:', expectedSignature.substring(0, 20) + '...')
      
      if (expectedSignature !== signature) {
        console.error('❌ Invalid webhook signature')
        console.error('Expected:', expectedSignature.substring(0, 20) + '...')
        console.error('Received:', signature.substring(0, 20) + '...')
        return new Response(
          JSON.stringify({ error: 'Invalid webhook signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      const webhookData = JSON.parse(body)
      console.log('✅ Webhook signature verified')
      console.log('Webhook event:', webhookData.event)
      console.log('Webhook data:', JSON.stringify(webhookData, null, 2))
      
      if (webhookData.event === 'payment.captured') {
        const payment = webhookData.payload.payment.entity
        console.log('💰 Payment captured:', payment.id)
        console.log('Payment amount:', payment.amount)
        console.log('Payment status:', payment.status)
        
        // Update payment record
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('razorpay_payment_id', payment.id)
        
        if (updateError) {
          console.error('❌ Failed to update payment:', updateError)
        } else {
          console.log('✅ Payment record updated successfully')
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('ℹ️ Webhook event processed:', webhookData.event)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle direct payment verification (existing functionality)
    console.log('=== Processing Direct Payment Verification ===')
    
    const requestBody = await req.text()
    console.log('Request body:', requestBody)
    
    const { payment_id, order_id, signature, customer_details } = JSON.parse(requestBody)
    
    console.log('Payment verification data:', {
      payment_id: payment_id?.substring(0, 20) + '...',
      order_id: order_id?.substring(0, 20) + '...',
      signature: signature?.substring(0, 20) + '...',
      customer_email: customer_details?.email
    })

    if (!payment_id || !order_id || !signature) {
      console.error('❌ Missing required payment verification fields')
      return new Response(
        JSON.stringify({ error: 'Missing required payment verification fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify payment signature
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    console.log('Using Razorpay key secret for verification')
    
    const crypto = await import('node:crypto')
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(order_id + '|' + payment_id)
      .digest('hex')

    console.log('Expected signature for verification:', expectedSignature.substring(0, 20) + '...')
    console.log('Received signature for verification:', signature.substring(0, 20) + '...')

    if (expectedSignature !== signature) {
      console.error('❌ Invalid payment signature')
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Payment signature verified successfully')

    // Find existing user by email or create new one
    let userId = null
    
    if (customer_details?.email) {
      console.log('Processing customer details for email:', customer_details.email)
      
      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(customer_details.email)
      
      if (userError) {
        console.error('Error checking existing user:', userError)
      } else if (existingUser.user) {
        console.log('✅ Found existing user:', existingUser.user.id)
        userId = existingUser.user.id
      } else {
        console.log('Creating new user account for:', customer_details.email)
        
        // Create new user account
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!' // Ensure strong password
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: customer_details.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: customer_details.name || '',
            phone: customer_details.phone || '',
            payment_verified: true
          }
        })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          return new Response(
            JSON.stringify({ error: 'Failed to create user account', details: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('✅ New user created:', newUser.user?.id)
        userId = newUser.user?.id
      }
    }

    // Store payment record with user_id
    console.log('Storing payment record...')
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
      console.error('❌ Payment storage error:', paymentError)
      return new Response(
        JSON.stringify({ error: 'Failed to store payment record', details: paymentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Payment record stored successfully')

    // Update user profile to mark payment as verified
    if (userId) {
      console.log('Updating user profile for:', userId)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: customer_details?.email,
          payment_verified: true,
          subscription_status: 'active'
        })

      if (profileError) {
        console.error('⚠️ Profile update error:', profileError)
      } else {
        console.log('✅ User profile updated successfully')
      }
    }

    console.log('=== Payment Verification Completed Successfully ===')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully',
        user_id: userId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: 'Payment verification failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
