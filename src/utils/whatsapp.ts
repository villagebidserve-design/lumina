import { CartItem, Product, StoreSettings } from '../types';
import { sanitizeInput, sanitizePhone } from './security';

export function createWhatsAppOrderLink(
  items: CartItem[],
  settings: StoreSettings,
  customerInfo: { name: string; phone: string; address: string; pincode?: string; vehicleModel?: string; notes?: string },
  lang: 'en' | 'ta' = 'en'
): string {
  const cleanNumber = sanitizePhone(settings.whatsappNumber).replace(/[^0-9]/g, '');

  let totalSavings = 0;
  let grandTotal = 0;

  const itemsList = items.map((item, index) => {
    const unitPrice = item.product.price;
    const itemTotal = unitPrice * item.quantity;
    grandTotal += itemTotal;

    const mrpTotal = item.product.mrp * item.quantity;
    totalSavings += (mrpTotal - itemTotal);

    return `${index + 1}. *${sanitizeInput(item.product.name)}*
   • ${lang === 'ta' ? 'அளவு (Qty)' : 'Quantity'}: ${item.quantity}
   • ${lang === 'ta' ? 'வகை' : 'Item'}: 100% Brand New Luminexs (No Exchange)
   • ${lang === 'ta' ? 'விலை' : 'Price'}: ₹${unitPrice.toLocaleString('en-IN')} x ${item.quantity} = *₹${itemTotal.toLocaleString('en-IN')}*`;
  }).join('\n\n');

  const safeName = sanitizeInput(customerInfo.name) || 'Not specified';
  const safePhone = sanitizePhone(customerInfo.phone) || 'Not specified';
  const safeAddress = sanitizeInput(customerInfo.address) || 'Not specified';
  const safePincode = customerInfo.pincode ? sanitizeInput(customerInfo.pincode) : '';
  const safeVehicle = customerInfo.vehicleModel ? sanitizeInput(customerInfo.vehicleModel) : '';
  const safeNotes = customerInfo.notes ? sanitizeInput(customerInfo.notes) : '';

  let message = '';

  if (lang === 'ta') {
    message = `வணக்கம் *${settings.storeName}*! 🙏

நான் உங்கள் இணையதளத்தில் இருந்து பேட்டரி ஆர்டர் செய்ய விரும்புகிறேன்:

📦 *ஆர்டர் விவரங்கள் (ORDER ITEMS):*
----------------------------------------
${itemsList}
----------------------------------------
💰 *மொத்தத் தொகை (Total Payable): ₹${grandTotal.toLocaleString('en-IN')}*
🎉 *மொத்த தள்ளுபடி சேமிப்பு: ₹${totalSavings.toLocaleString('en-IN')}*
🚚 *டோர்ஸ்டெப் டெலிவரி: 3 நாட்களுக்குள் இலவச டெலிவரி (FREE)*
💳 *கட்டணம்: ஆன்லைன் பேமெண்ட் (UPI/Cards) அல்லது கேஷ் ஆன் டெலிவரி*

👤 *வாடிக்கையாளர் விவரங்கள் (Customer Info):*
• பெயர்: ${safeName}
• தொடர்பு எண்: ${safePhone}
• டெலிவரி முகவரி: ${safeAddress}${safePincode ? `\n• பின்கோடு: ${safePincode} (3 நாட்களில் டெலிவரி)` : ''}${safeVehicle ? `\n• வாகன மாடல்: ${safeVehicle}` : ''}
${safeNotes ? `• குறிப்பு: ${safeNotes}` : ''}

தயவுசெய்து இந்த ஆர்டரை உறுதி செய்து டெலிவரி அனுப்பவும். நன்றி!`;
  } else {
    message = `Hello *${settings.storeName}*! 👋

I would like to place an order from your website:

📦 *ORDER ITEMS:*
----------------------------------------
${itemsList}
----------------------------------------
💰 *Grand Total Payable: ₹${grandTotal.toLocaleString('en-IN')}*
🎉 *You Saved: ₹${totalSavings.toLocaleString('en-IN')} OFF MRP*
🚚 *Doorstep Delivery: FREE (Delivery within 3 Days)*
💳 *Payment Mode: Online Payment Accepted (UPI / Cards / Net Banking) or COD*

👤 *CUSTOMER DETAILS:*
• Name: ${safeName}
• Phone: ${safePhone}
• Delivery Address: ${safeAddress}${safePincode ? `\n• Pincode: ${safePincode} (Delivery within 3 Days)` : ''}${safeVehicle ? `\n• Vehicle Model: ${safeVehicle}` : ''}
${safeNotes ? `• Special Note: ${safeNotes}` : ''}

Please confirm this order and dispatch. Thank you!`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function createQuickInquiryLink(product: Product, settings: StoreSettings, lang: 'en' | 'ta'): string {
  const cleanNumber = sanitizePhone(settings.whatsappNumber).replace(/[^0-9]/g, '');
  const productName = sanitizeInput(product.name);
  
  const text = lang === 'ta'
    ? `வணக்கம் *${settings.storeName}*! எனக்கு இந்த *${productName}* (விலை: ₹${product.price.toLocaleString('en-IN')}) பேட்டரி பற்றி கூடுதல் விவரங்கள் தேவை. டெலிவரி கிடைக்குமா?`
    : `Hello *${settings.storeName}*! I am interested in *${productName}* (Price: ₹${product.price.toLocaleString('en-IN')}). Is it in stock for doorstep delivery?`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function createGeneralSupportLink(settings: StoreSettings, lang: 'en' | 'ta'): string {
  const cleanNumber = sanitizePhone(settings.whatsappNumber).replace(/[^0-9]/g, '');
  const text = lang === 'ta'
    ? `வணக்கம் *${settings.storeName}*! எனக்கு எனது வாகனத்திற்கு / வீட்டிற்கு பொருத்தமான பேட்டரியை தேர்வு செய்ய உதவி தேவை.`
    : `Hello *${settings.storeName}*! I need assistance choosing the right battery for my vehicle / home inverter.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
