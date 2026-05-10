
import { Prisma } from '@prisma/client';

type InvoiceFields = keyof Prisma.InvoicePayload['scalars'];
const hasPaidAmount: InvoiceFields extends 'paidAmount' ? true : false = true as any;

console.log('Has paidAmount:', hasPaidAmount);
