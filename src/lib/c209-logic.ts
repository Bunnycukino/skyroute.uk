// ============================================================================
// C209/C208 Logic System - Complete Business Rules Engine
// Equivalent to Excel VBA C209/C208 automation system
// ============================================================================

export interface C209Record {
  id?: string;
  awb: string; // Air Waybill Number
  pieces: number;
  weight: number;
  origin: string;
  destination: string;
  flightNumber?: string;
  flightDate?: Date | string;
  status: 'NEW BUILD' | 'RW' | 'C209' | 'C208' | 'EXPIRED' | 'REALLOCATED';
  c209Date?: Date | string;
  c208Date?: Date | string;
  expiryDate?: Date | string;
  reallocatedTo?: string;
  reallocatedFrom?: string;
  reallocatedDate?: Date | string;
  warehouse?: string;
  remarks?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReallocationResult {
  success: boolean;
  newAWB?: string;
  message: string;
  originalRecord?: C209Record;
  newRecord?: C209Record;
}

// ============================================================================
// CONSTANTS - Business Rules Configuration
// ============================================================================

export const C209_CONFIG = {
  // Expiry rules (in days)
  DEFAULT_EXPIRY_DAYS: 30,
  WARNING_DAYS_BEFORE_EXPIRY: 7,
  CRITICAL_DAYS_BEFORE_EXPIRY: 3,
  
  // Status transition rules
  VALID_STATUS_TRANSITIONS: {
    'NEW BUILD': ['RW', 'C209'],
    'RW': ['C209', 'EXPIRED'],
    'C209': ['C208', 'EXPIRED', 'REALLOCATED'],
    'C208': ['EXPIRED', 'REALLOCATED'],
    'EXPIRED': ['REALLOCATED'],
    'REALLOCATED': []
  } as Record<string, string[]>,
  
  // AWB validation
  AWB_FORMAT: /^\d{3}-\d{8}$/, // Format: XXX-XXXXXXXX
  AWB_PREFIX_LENGTH: 3,
  AWB_NUMBER_LENGTH: 8,
};

// ============================================================================
// AWB VALIDATION & FORMATTING
// ============================================================================

/**
 * Validates AWB number format
 */
export function validateAWB(awb: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!awb || awb.trim() === '') {
    errors.push('AWB number is required');
    return { isValid: false, errors, warnings };
  }
  
  const cleanAWB = awb.trim().replace(/\s+/g, '');
  
  // Check format
  if (!C209_CONFIG.AWB_FORMAT.test(cleanAWB)) {
    errors.push(`AWB format must be XXX-XXXXXXXX (e.g., 176-12345678)`);
  }
  
  // Check prefix (airline code)
  const parts = cleanAWB.split('-');
  if (parts.length === 2) {
    const prefix = parts[0];
    const number = parts[1];
    
    if (prefix.length !== C209_CONFIG.AWB_PREFIX_LENGTH) {
      errors.push(`AWB prefix must be ${C209_CONFIG.AWB_PREFIX_LENGTH} digits`);
    }
    
    if (number.length !== C209_CONFIG.AWB_NUMBER_LENGTH) {
      errors.push(`AWB number must be ${C209_CONFIG.AWB_NUMBER_LENGTH} digits`);
    }
    
    // Check for valid airline prefix (176 = Emirates)
    if (!['176', '020', '071'].includes(prefix)) {
      warnings.push(`Unusual airline prefix: ${prefix}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Formats AWB number to standard format
 */
export function formatAWB(awb: string): string {
  const clean = awb.replace(/[^0-9]/g, '');
  
  if (clean.length === 11) {
    return `${clean.substring(0, 3)}-${clean.substring(3)}`;
  }
  
  return awb;
}

// ============================================================================
// DATE & EXPIRY CALCULATIONS
// ============================================================================

/**
 * Calculates expiry date based on C209 date
 */
export function calculateExpiryDate(
  c209Date: Date | string,
  customDays?: number
): Date {
  const date = typeof c209Date === 'string' ? new Date(c209Date) : c209Date;
  const days = customDays || C209_CONFIG.DEFAULT_EXPIRY_DAYS;
  
  const expiryDate = new Date(date);
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return expiryDate;
}

/**
 * Checks if record is expired
 */
export function isExpired(record: C209Record): boolean {
  if (!record.expiryDate) return false;
  
  const expiry = typeof record.expiryDate === 'string' 
    ? new Date(record.expiryDate) 
    : record.expiryDate;
  
  return new Date() > expiry;
}

/**
 * Gets days until expiry (negative if expired)
 */
export function getDaysUntilExpiry(record: C209Record): number | null {
  if (!record.expiryDate) return null;
  
  const expiry = typeof record.expiryDate === 'string'
    ? new Date(record.expiryDate)
    : record.expiryDate;
  
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Gets expiry status with color coding
 */
export function getExpiryStatus(record: C209Record): {
  status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'NORMAL' | 'NONE';
  daysLeft: number | null;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'gray';
  message: string;
} {
  const daysLeft = getDaysUntilExpiry(record);
  
  if (daysLeft === null) {
    return {
      status: 'NONE',
      daysLeft: null,
      color: 'gray',
      message: 'No expiry date set'
    };
  }
  
  if (daysLeft < 0) {
    return {
      status: 'EXPIRED',
      daysLeft,
      color: 'red',
      message: `Expired ${Math.abs(daysLeft)} days ago`
    };
  }
  
  if (daysLeft <= C209_CONFIG.CRITICAL_DAYS_BEFORE_EXPIRY) {
    return {
      status: 'CRITICAL',
      daysLeft,
      color: 'orange',
      message: `Expires in ${daysLeft} days - URGENT`
    };
  }
  
  if (daysLeft <= C209_CONFIG.WARNING_DAYS_BEFORE_EXPIRY) {
    return {
      status: 'WARNING',
      daysLeft,
      color: 'yellow',
      message: `Expires in ${daysLeft} days`
    };
  }
  
  return {
    status: 'NORMAL',
    daysLeft,
    color: 'green',
    message: `${daysLeft} days remaining`
  };
}

// ============================================================================
// STATUS TRANSITION LOGIC
// ============================================================================

/**
 * Validates if status transition is allowed
 */
export function canTransitionStatus(
  currentStatus: string,
  newStatus: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const validTransitions = C209_CONFIG.VALID_STATUS_TRANSITIONS[currentStatus];
  
  if (!validTransitions) {
    errors.push(`Invalid current status: ${currentStatus}`);
    return { isValid: false, errors, warnings };
  }
  
  if (!validTransitions.includes(newStatus)) {
    errors.push(
      `Cannot transition from ${currentStatus} to ${newStatus}. ` +
      `Valid transitions: ${validTransitions.join(', ')}`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Transitions record to NEW BUILD status
 */
export function transitionToNewBuild(record: Partial<C209Record>): C209Record {
  return {
    ...record,
    status: 'NEW BUILD',
    updatedAt: new Date().toISOString()
  } as C209Record;
}

/**
 * Transitions record to RW (Ready for Work) status
 */
export function transitionToRW(record: C209Record): C209Record {
  const validation = canTransitionStatus(record.status, 'RW');
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  return {
    ...record,
    status: 'RW',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Transitions record to C209 status and sets expiry
 */
export function transitionToC209(
  record: C209Record,
  customExpiryDays?: number
): C209Record {
  const validation = canTransitionStatus(record.status, 'C209');
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const now = new Date();
  const expiryDate = calculateExpiryDate(now, customExpiryDays);
  
  return {
    ...record,
    status: 'C209',
    c209Date: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    updatedAt: now.toISOString()
  };
}

/**
 * Transitions record to C208 status
 */
export function transitionToC208(record: C209Record): C209Record {
  const validation = canTransitionStatus(record.status, 'C208');
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  
  const now = new Date();
  
  return {
    ...record,
    status: 'C208',
    c208Date: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

/**
 * Marks record as expired
 */
export function markAsExpired(record: C209Record): C209Record {
  return {
    ...record,
    status: 'EXPIRED',
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// REALLOCATION LOGIC
// ============================================================================

/**
 * Generates new AWB for reallocation
 */
export function generateReallocationAWB(
  originalAWB: string,
  counter?: number
): string {
  const parts = originalAWB.split('-');
  if (parts.length !== 2) return originalAWB;
  
  const prefix = parts[0];
  const number = parseInt(parts[1]);
  const newNumber = counter ? number + counter : number + 1;
  
  return `${prefix}-${newNumber.toString().padStart(8, '0')}`;
}

/**
 * Reallocates cargo to new AWB
 */
export function reallocateCargo(
  originalRecord: C209Record,
  newAWB?: string,
  options?: {
    keepOriginal?: boolean;
    copyPieces?: number;
    reason?: string;
  }
): ReallocationResult {
  // Validate original record can be reallocated
  const validation = canTransitionStatus(originalRecord.status, 'REALLOCATED');
  
  if (!validation.isValid) {
    return {
      success: false,
      message: `Cannot reallocate: ${validation.errors.join(', ')}`
    };
  }
  
  // Generate new AWB if not provided
  const targetAWB = newAWB || generateReallocationAWB(originalRecord.awb);
  
  // Validate new AWB
  const awbValidation = validateAWB(targetAWB);
  if (!awbValidation.isValid) {
    return {
      success: false,
      message: `Invalid new AWB: ${awbValidation.errors.join(', ')}`
    };
  }
  
  const now = new Date();
  const piecesToReallocate = options?.copyPieces || originalRecord.pieces;
  
  // Mark original as reallocated
  const updatedOriginal: C209Record = {
    ...originalRecord,
    status: 'REALLOCATED',
    reallocatedTo: targetAWB,
    reallocatedDate: now.toISOString(),
    remarks: options?.reason 
      ? `${originalRecord.remarks || ''} | REALLOCATED: ${options.reason}`.trim()
      : `${originalRecord.remarks || ''} | REALLOCATED to ${targetAWB}`.trim(),
    updatedAt: now.toISOString()
  };
  
  // Create new record
  const newRecord: C209Record = {
    ...originalRecord,
    id: undefined, // New ID will be generated
    awb: targetAWB,
    status: 'NEW BUILD',
    pieces: piecesToReallocate,
    reallocatedFrom: originalRecord.awb,
    reallocatedDate: now.toISOString(),
    c209Date: undefined,
    c208Date: undefined,
    expiryDate: undefined,
    remarks: `REALLOCATED from ${originalRecord.awb}` + 
             (options?.reason ? ` | Reason: ${options.reason}` : ''),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  
  return {
    success: true,
    newAWB: targetAWB,
    message: `Successfully reallocated ${piecesToReallocate} pieces from ${originalRecord.awb} to ${targetAWB}`,
    originalRecord: updatedOriginal,
    newRecord
  };
}

/**
 * Splits cargo into multiple AWBs
 */
export function splitCargo(
  originalRecord: C209Record,
  splits: Array<{ awb?: string; pieces: number; weight: number }>
): ReallocationResult[] {
  const results: ReallocationResult[] = [];
  
  // Validate total pieces and weight
  const totalSplitPieces = splits.reduce((sum, s) => sum + s.pieces, 0);
  const totalSplitWeight = splits.reduce((sum, s) => sum + s.weight, 0);
  
  if (totalSplitPieces > originalRecord.pieces) {
    return [{
      success: false,
      message: `Cannot split: Total pieces (${totalSplitPieces}) exceeds original (${originalRecord.pieces})`
    }];
  }
  
  if (totalSplitWeight > originalRecord.weight) {
    return [{
      success: false,
      message: `Cannot split: Total weight (${totalSplitWeight}) exceeds original (${originalRecord.weight})`
    }];
  }
  
  // Create reallocation for each split
  splits.forEach((split, index) => {
    const targetAWB = split.awb || generateReallocationAWB(originalRecord.awb, index + 1);
    
    const result = reallocateCargo(
      originalRecord,
      targetAWB,
      {
        copyPieces: split.pieces,
        reason: `SPLIT ${index + 1}/${splits.length}: ${split.pieces} pieces / ${split.weight} kg`
      }
    );
    
    if (result.success && result.newRecord) {
      result.newRecord.weight = split.weight;
    }
    
    results.push(result);
  });
  
  return results;
}

// ============================================================================
// RECORD VALIDATION
// ============================================================================

/**
 * Validates complete C209 record
 */
export function validateC209Record(record: Partial<C209Record>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!record.awb) {
    errors.push('AWB number is required');
  } else {
    const awbValidation = validateAWB(record.awb);
    errors.push(...awbValidation.errors);
    warnings.push(...awbValidation.warnings);
  }
  
  if (!record.pieces || record.pieces <= 0) {
    errors.push('Pieces must be greater than 0');
  }
  
  if (!record.weight || record.weight <= 0) {
    errors.push('Weight must be greater than 0');
  }
  
  if (!record.origin || record.origin.length !== 3) {
    errors.push('Origin must be 3-letter IATA code (e.g., DXB)');
  }
  
  if (!record.destination || record.destination.length !== 3) {
    errors.push('Destination must be 3-letter IATA code (e.g., LHR)');
  }
  
  if (!record.status) {
    errors.push('Status is required');
  }
  
  // Logical validations
  if (record.origin === record.destination) {
    errors.push('Origin and destination cannot be the same');
  }
  
  // Status-specific validations
  if (record.status === 'C209' && !record.c209Date) {
    warnings.push('C209 status should have c209Date set');
  }
  
  if (record.status === 'C208' && !record.c208Date) {
    warnings.push('C208 status should have c208Date set');
  }
  
  if (record.status === 'REALLOCATED' && !record.reallocatedTo) {
    warnings.push('Reallocated status should have reallocatedTo AWB');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Checks multiple records for expiry and returns expired ones
 */
export function findExpiredRecords(records: C209Record[]): C209Record[] {
  return records.filter(record => 
    (record.status === 'C209' || record.status === 'C208') && 
    isExpired(record)
  );
}

/**
 * Gets records expiring soon
 */
export function findExpiringRecords(
  records: C209Record[],
  daysThreshold: number = C209_CONFIG.WARNING_DAYS_BEFORE_EXPIRY
): C209Record[] {
  return records.filter(record => {
    const daysLeft = getDaysUntilExpiry(record);
    return daysLeft !== null && daysLeft > 0 && daysLeft <= daysThreshold;
  });
}

/**
 * Processes automatic status updates based on expiry
 */
export function processExpiryUpdates(records: C209Record[]): {
  updated: C209Record[];
  unchanged: C209Record[];
} {
  const updated: C209Record[] = [];
  const unchanged: C209Record[] = [];
  
  records.forEach(record => {
    if (isExpired(record) && record.status !== 'EXPIRED') {
      updated.push(markAsExpired(record));
    } else {
      unchanged.push(record);
    }
  });
  
  return { updated, unchanged };
}

// ============================================================================
// REPORTING & STATISTICS
// ============================================================================

/**
 * Gets statistics for records
 */
export function getRecordStatistics(records: C209Record[]) {
  const total = records.length;
  
  const byStatus = records.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const expired = findExpiredRecords(records).length;
  const expiringSoon = findExpiringRecords(records).length;
  
  const totalPieces = records.reduce((sum, r) => sum + r.pieces, 0);
  const totalWeight = records.reduce((sum, r) => sum + r.weight, 0);
  
  return {
    total,
    byStatus,
    expired,
    expiringSoon,
    totalPieces,
    totalWeight,
    averagePieces: total > 0 ? Math.round(totalPieces / total) : 0,
    averageWeight: total > 0 ? Math.round(totalWeight / total) : 0
  };
}

/**
 * Generates report for records
 */
export function generateReport(records: C209Record[]) {
  const stats = getRecordStatistics(records);
  const expiredList = findExpiredRecords(records);
  const expiringList = findExpiringRecords(records);
  
  return {
    generated: new Date().toISOString(),
    statistics: stats,
    alerts: {
      expired: expiredList.map(r => ({
        awb: r.awb,
        status: r.status,
        expiryDate: r.expiryDate,
        daysOverdue: Math.abs(getDaysUntilExpiry(r) || 0)
      })),
      expiringSoon: expiringList.map(r => ({
        awb: r.awb,
        status: r.status,
        expiryDate: r.expiryDate,
        daysLeft: getDaysUntilExpiry(r)
      }))
    }
  };
}