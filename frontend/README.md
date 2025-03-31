# 🚀 Frontend Setup

Welcome! Follow the steps below to set up and run the frontend of your project.

---

## 📚 Prerequisites
Ensure you have the following installed:
- Node.js (v16+ recommended)
- npm (v8+ recommended)

---

## ⚡️ Getting Started

To set up and run the frontend:

<div style="background-color: #f4f4f4; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the frontend
npm run start

```

## **Payment Details for Testing**  

| Payment Method   | Test Input                             | Status |
|-----------------|--------------------------------------|---------|
| **Card (Success)**  | 4111 1111 1111 1111                | ✅ Payment Successful |
| **Card (Failure)**  | 4000 0000 0000 0002                | ❌ Payment Failed |
| **UPI (Success)**   | success@razorpay                   | ✅ Payment Successful |
| **UPI (Failure)**   | failure@razorpay                   | ❌ Payment Failed |
| **Net Banking**     | "ICICI" / "HDFC"                    | ✅ / ❌ Based on selection |
| **Wallet**         | "PhonePe", "Paytm"                  | ✅ Payment Successful |
| **EMI**           | 5204 2424 2424 2424 (HDFC)          | ✅ EMI Successful |
| **Invalid Input**  | 0000 0000 0000 0000                | ❌ Error |
