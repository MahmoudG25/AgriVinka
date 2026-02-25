import React, { useState } from 'react';
import { FaRegCopy, FaCheck } from 'react-icons/fa6';
import { BsBank2 } from 'react-icons/bs';

const BankDetailsCard = () => {
  const [copied, setCopied] = useState(false);
  const bankDetails = {
    bankName: 'مصرف الراجحي',
    accountName: 'مؤسسة أكاديمية نماء للتدريب',
    iban: 'SA05 8000 0000 6080 1010 1234'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.iban.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background-alt p-6 rounded-2xl border border-border-light mt-6">
      <div className="flex items-center gap-2 mb-4 text-heading-dark font-bold text-lg">
        <BsBank2 className="text-primary" />
        <h3>تفاصيل الحساب البنكي</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center sm:flex-row flex-col sm:items-start gap-2">
          <span className="text-gray-500">اسم البنك</span>
          <span className="font-bold text-body-text">{bankDetails.bankName}</span>
        </div>

        <div className="flex justify-between items-center sm:flex-row flex-col sm:items-start gap-2">
          <span className="text-gray-500">اسم المستفيد</span>
          <span className="font-bold text-body-text">{bankDetails.accountName}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-light flex items-center justify-between dir-ltr mt-2 shadow-sm group hover:border-primary/30 transition-colors">
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
            title="نسخ الآيبان"
          >
            {copied ? <FaCheck className="text-green-500" /> : <FaRegCopy />}
          </button>

          <code className="font-mono text-lg font-bold text-heading-dark tracking-wider text-right flex-grow px-4">
            {bankDetails.iban}
          </code>
          <span className="text-xs text-gray-400 font-sans absolute -top-3 right-0">رقم الآيبان (IBAN)</span>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsCard;
