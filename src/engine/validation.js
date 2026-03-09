// Form validation for CostSegPro
// Returns { valid: boolean, errors: { field: message } }

function clean(v) {
  if (typeof v !== 'string') return v;
  return v.replace(/[$,\s]/g, '');
}

export function validateForm(data, step) {
  const errors = {};

  if (step >= 0) {
    // Step 0: Property (address, type, price, land, year purchased)
    const price = parseFloat(clean(data.purchasePrice));
    if (!data.purchasePrice || isNaN(price) || price <= 0) {
      errors.purchasePrice = "Enter a purchase price (e.g. 590000)";
    } else if (price < 50000) {
      errors.purchasePrice = "Purchase price seems too low for cost segregation";
    } else if (price > 100000000) {
      errors.purchasePrice = "Please verify this purchase price";
    }

    const land = parseFloat(clean(data.landValue));
    if (data.landValue && !isNaN(land)) {
      if (land < 0) errors.landValue = "Land value cannot be negative";
      else if (land >= price) errors.landValue = "Land value must be less than purchase price";
      else if (price > 0 && land / price > 0.50) {
        errors.landValue = "Land value exceeds 50% of purchase price — please verify";
      }
    }

    const yp = parseInt(clean(data.yearPurchased));
    if (!data.yearPurchased || isNaN(yp)) {
      errors.yearPurchased = "Enter the year you purchased or placed in service";
    } else if (yp < 1986) {
      errors.yearPurchased = "MACRS applies to property placed in service after 1986";
    } else if (yp > new Date().getFullYear() + 1) {
      errors.yearPurchased = "Please enter a valid year";
    }
  }

  if (step >= 1) {
    // Step 1: Building Info (sqft, year built, tax rate)
    const yb = parseInt(clean(data.yearBuilt));
    if (!data.yearBuilt || isNaN(yb)) {
      errors.yearBuilt = "Enter the year the property was built (e.g. 1990)";
    } else if (yb < 1900 || yb > new Date().getFullYear()) {
      errors.yearBuilt = "Please enter a valid year between 1900 and " + new Date().getFullYear();
    }
    const sqft = parseFloat(clean(data.sqft));
    if (!data.sqft || isNaN(sqft) || sqft <= 0) {
      errors.sqft = "Enter the building's total square footage";
    } else if (sqft < 200) {
      errors.sqft = "Square footage seems too low";
    } else if (sqft > 500000) {
      errors.sqft = "Please verify square footage";
    }

    const rate = parseFloat(clean(data.taxRate));
    if (!data.taxRate || isNaN(rate) || rate <= 0) {
      errors.taxRate = "Enter your combined federal + state tax rate (e.g. 37)";
    } else if (rate > 55) {
      errors.taxRate = "Tax rate seems high — enter your combined federal + state rate";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// Soft warnings (non-blocking)
export function getWarnings(data) {
  const warnings = [];
  const price = parseFloat(clean(data.purchasePrice)) || 0;
  const land = parseFloat(clean(data.landValue)) || 0;

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
