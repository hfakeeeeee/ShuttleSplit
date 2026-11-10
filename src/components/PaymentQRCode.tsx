import React from 'react';

const PaymentQRCode: React.FC = () => (
  <div className="qr-section">
    <h3><i className="fas fa-qrcode" aria-hidden="true"></i> MoMo Payment</h3>
    <div className="payment-methods">
      <div className="payment-method">
        <div className="payment-qr-large">
          <img
            src={`${process.env.PUBLIC_URL}/images/new_momo.jpg`}
            alt="MoMo payment QR code for Nguyen Quoc Huy"
            className="payment-qr-image"
            width={1212}
            height={1326}
          />
        </div>
      </div>
    </div>
  </div>
);

export default PaymentQRCode;
