const { StandardCheckoutClient, Env, MetaInfo, StandardCheckoutPayRequest } = require("pg-sdk-node") ;
const { randomUUID } = require("crypto") ;

const clientId = "TEST-M23MB33JWPBPX_25082";
const clientSecret = "ODVmNGExNGUtOWQ2Yi00NDlkLWE0NzMtMjQwMWVlNmJkYTBk";
const clientVersion = "1.0";   
const env = Env.SANDBOX;       
// Create PhonePe client instance
const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    // validate amount
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ success: 0, message: "Amount must be a positive number" });
    }

    const merchantOrderId = randomUUID();
    const redirectUrl = process.env.redirectUrl; // frontend route after payment

    const metaInfo = MetaInfo.builder()
      .udf1("custom-data-1")
      .udf2("custom-data-2")
      .build();

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amt)
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    const response = await client.pay(request);
    console.log("Payment API response:", response);

    return res.json({
      success: 1,                         // ✅ success flag
      message: "Payment created successfully",
      checkoutPageUrl: response.redirectUrl,
      orderId: merchantOrderId,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ success: 0, message: "Payment creation failed" });
  }
};

