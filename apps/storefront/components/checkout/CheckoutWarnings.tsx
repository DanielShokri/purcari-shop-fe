interface CheckoutWarningsProps {
  validationErrors: string[];
  appliedBenefits: string[];
}

export default function CheckoutWarnings({ validationErrors, appliedBenefits }: CheckoutWarningsProps) {
  if (validationErrors.length === 0 && appliedBenefits.length === 0) {
    return null;
  }

  return (
    <>
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red d-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-bold">שים לב:</p>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {appliedBenefits.length > 0 && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-bold">הטבות פעילות:</p>
          <ul className="list-disc list-inside">
            {appliedBenefits.map((benefit, idx) => (
              <li key={idx}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
