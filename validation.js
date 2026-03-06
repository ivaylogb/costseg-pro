// Form validation for CostSegPro
// Returns { valid: boolean, errors: { field: message } }

export function validateForm(data, step) {
  const errors = {};

  if (step >= 1) {
    // Step 1: Property Details
    const price = parseFloat(data.purchasePrice);
    if (!data.purchasePrice || isNaN(price) || price <= 0) {
      errors.purchasePrice = "Purchase price is required";
    } else if (price < 50000) {
      errors.purchasePrice = "Purchase price seems too low for cost segregation";
    } else if (price > 100000000) {
      errors.purchasePrice = "Please verify this purchase price";
    }

    const land = parseFloat(data.landValue);
    if (data.landValue && !isNaN(land)) {
      if (land < 0) errors.landValue = "Land value cannot be negative";
      else if (land >= price) errors.landValue = "Land value must be less than purchase price";
      else if (price > 0 && land / price > 0.50) {
        errors.landValue = "Land value exceeds 50% of purchase price — please verify";
      }
    }

    const yb = parseInt(data.yearBuilt);
    if (!data.yearBuilt || isNaN(yb)) {
      errors.yearBuilt = "Year built is required";
    } else if (yb < 1900 || yb > new Date().getFullYear()) {
      errors.yearBuilt = "Please enter a valid year";
    }

    const yp = parseInt(data.yearPurchased);
    if (!data.yearPurchased || isNaN(yp)) {
      errors.yearPurchased = "Year purchased is required";
    } else if (yp < 1986) {
      errors.yearPurchased = "MACRS applies to property placed in service after 1986";
    } else if (yp > new Date().getFullYear() + 1) {
      errors.yearPurchased = "Please enter a valid year";
    }
  }

  if (step >= 2) {
    // Step 2: Building Info
    const sqft = parseFloat(data.sqft);
    if (!data.sqft || isNaN(sqft) || sqft <= 0) {
      errors.sqft = "Square footage is required for accurate estimates";
    } else if (sqft < 200) {
      errors.sqft = "Square footage seems too low";
    } else if (sqft > 500000) {
      errors.sqft = "Please verify square footage";
    }

    const rate = parseFloat(data.taxRate);
    if (!data.taxRate || isNaN(rate) || rate <= 0) {
      errors.taxRate = "Tax rate is required";
    } else if (rate > 55) {
      errors.taxRate = "Tax rate seems high — enter your combined federal + state rate";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Soft warnings (non-blocking)
export function getWarnings(data) {
  const warnings = [];
  const price = parseFloat(data.purchasePrice) || 0;
  const land = parseFloat(data.landValue) || 0;

  if (price > 0 && land === 0) {
    warnings.push("Land value is $0. Most properties have some land value — check your county assessor.");
  }

  if (price > 0 && price < 150000) {
    warnings.push("For properties under $150K, the cost of a formal study may exceed the tax benefit. This estimate can help you evaluate.");
  }

  const yp = parseInt(data.yearPurchased) || 0;
  if (yp > 0 && yp < new Date().getFullYear()) {
    warnings.push(`Property was placed in service in ${yp}. You may need to file Form 3115 (Change in Accounting Method) to claim the catch-up deduction.`);
  }

  if (data.isShortTermRental && data.isFurnished === false) {
    warnings.push("Most short-term rentals are furnished. If this property has furniture, toggle 'Furnished' for a more accurate estimate.");
  }

  return warnings;
}
