/**
 * Utility functions for validating CSV headers.
 */

export const normalizeHeader = (h = '') =>
  h
    .trim()
    .replace(/\./g, '') // remove dots
    .replace(/\s+/g, '') // remove spaces
    .toLowerCase();

export const getHeaderMismatchDetails = (receivedHeaders = [], expectedHeaders = []) => {
  const expectedNorm = expectedHeaders.map(normalizeHeader);
  const receivedNorm = receivedHeaders.map(normalizeHeader);

  const missing = expectedHeaders.filter((h) => !receivedNorm.includes(normalizeHeader(h)));
  const extra = receivedHeaders.filter((h) => !expectedNorm.includes(normalizeHeader(h)));

  const orderMismatch = false; // allow different order

  return {
    isValid: missing.length === 0 && extra.length === 0 && !orderMismatch,
    missing,
    extra,
    orderMismatch
  };
};

export const parseCSVToRows = (csvText) => {
  const result = [];
  let row = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(currentVal.trim());
      result.push(row);
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }x
  }

  if (currentVal !== "" || row.length > 0) {
    row.push(currentVal.trim());
    result.push(row);
  }

  return result.filter(r => r.length > 0 && r.some(val => val !== ""));
};

export const getFeeCsvHeaders = (rows) => {
  if (rows.length < 2) return [];
  const row1 = rows[0];
  const row2 = rows[1];

  let currentGroup = "";
  const flatHeaders = [];
  const maxLength = Math.max(row1.length, row2.length);

  for (let i = 0; i < maxLength; i++) {
    const r1 = row1[i] ? row1[i].trim() : "";
    const r2 = row2[i] ? row2[i].trim() : "";

    if (r1 !== "") {
      currentGroup = r1;
    }

    const cleanR2 = r2.replace(/\s+/g, ' ');
    const cleanGroup = currentGroup.replace(/\s+/g, ' ');

    if (cleanGroup === "S. No." || cleanGroup === "Student Name" || cleanGroup === "Remarks") {
      flatHeaders.push(cleanGroup);
    } else {
      if (cleanR2 !== "") {
        flatHeaders.push(`${cleanGroup} - ${cleanR2}`);
      } else {
        flatHeaders.push(cleanGroup);
      }
    }
  }
  return flatHeaders;
};


// utils/csvValidation.js — add this new function alongside your existing ones

/**
 * Validates fee CSV headers structurally instead of against a fixed name list.
 * Fee type names are dynamic (any name, any count) — what must stay fixed is:
 *   1. First two headers: "S. No.", "Student Name"
 *   2. Every fee type block must have exactly 5 sub-columns,
 *      in this exact order: Total, Paid, Scholarship, Scholarship Amount, Due
 *   3. Optional trailing "Remarks" column
 */
export const validateFeeCsvStructure = (headers = []) => {
  const errors = [];

  // Trim optional trailing "Remarks" before checking fee-type blocks
  let workingHeaders = [...headers];
  const hasRemarks = workingHeaders[workingHeaders.length - 1] === FEE_CSV_OPTIONAL_TRAILING_HEADER;
  if (hasRemarks) {
    workingHeaders = workingHeaders.slice(0, -1);
  }

  // 1. Check fixed leading headers
  const leadingCount = FEE_CSV_FIXED_LEADING_HEADERS.length;
  const actualLeading = workingHeaders.slice(0, leadingCount);
  FEE_CSV_FIXED_LEADING_HEADERS.forEach((expected, i) => {
    if (normalizeHeader(actualLeading[i]) !== normalizeHeader(expected)) {
      errors.push(`Expected column ${i + 1} to be "${expected}", found "${actualLeading[i] || 'MISSING'}"`);
    }
  });

  // 2. Check fee-type blocks: everything after leading headers must divide evenly into 5s
  const feeTypeSection = workingHeaders.slice(leadingCount);
  const subCount = FEE_CSV_SUB_HEADERS.length; // 5

  if (feeTypeSection.length % subCount !== 0) {
    errors.push(
      `Fee type columns must come in complete groups of ${subCount} (Total, Paid, Scholarship, Scholarship Amount, Due). ` +
      `Found ${feeTypeSection.length} columns after "Student Name", which isn't a multiple of ${subCount}.`
    );
    return { isValid: false, errors, detectedFeeTypes: [] };
  }

  const detectedFeeTypes = [];
  const numFeeTypes = feeTypeSection.length / subCount;

  for (let i = 0; i < numFeeTypes; i++) {
    const block = feeTypeSection.slice(i * subCount, i * subCount + subCount);
    let feeTypeName = null;

    FEE_CSV_SUB_HEADERS.forEach((expectedSub, j) => {
      const actualHeader = block[j] || '';
      // actualHeader should look like "<FeeTypeName> - <expectedSub>"
      const expectedSuffix = ` - ${expectedSub}`;
      const normalizedActual = actualHeader.replace(/\s+/g, ' ').trim();

      if (!normalizedActual.toLowerCase().endsWith(expectedSuffix.toLowerCase())) {
        errors.push(
          `Column "${normalizedActual || 'MISSING'}" (position ${leadingCount + i * subCount + j + 1}) ` +
          `should end with "${expectedSuffix}"`
        );
      } else {
        // Extract fee type name from the first matched sub-header in this block
        const name = normalizedActual.slice(0, normalizedActual.length - expectedSuffix.length).trim();
        if (j === 0) feeTypeName = name;
      }
    });

    if (feeTypeName) detectedFeeTypes.push(feeTypeName);
  }

  return {
    isValid: errors.length === 0,
    errors,
    detectedFeeTypes // useful for showing "We detected these fee types: X, Y, Z" in the UI
  };
};