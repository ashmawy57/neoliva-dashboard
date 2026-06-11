const fs = require('fs');
const path = require('path');

// Target directories
const actionsDir = path.join(__dirname, '../src/app/actions');
const queryFilePath = path.join(__dirname, '../src/app/(dashboard)/dashboard/query.ts');

// Configuration of files to process
const FILES_TO_PROCESS = [
  'alerts.ts',
  'analytics.ts',
  'appointments.ts',
  'audit.ts',
  'billing.ts',
  'documents.ts',
  'events.ts',
  'expenses.ts',
  'finance.ts',
  'inventory.ts',
  'lab-orders.ts',
  'operational-rooms.ts',
  'patients.ts',
  'prescriptions.ts',
  'reports.ts',
  'rooms.ts',
  'services.ts',
  'settings.ts',
  'staff.ts',
  'treasury.ts',
  'treatment-plans.ts'
];

function getResourceAndAction(fileName, functionName) {
  let resource = '';
  const baseName = path.basename(fileName);
  if (baseName.includes('patient') || baseName.includes('document')) {
    resource = 'patients';
  } else if (baseName.includes('appointment')) {
    resource = 'appointments';
  } else if (baseName.includes('billing') || baseName.includes('finance') || baseName.includes('treasury')) {
    resource = 'billing';
  } else if (baseName.includes('expense')) {
    resource = 'expenses';
  } else if (baseName.includes('prescription') || baseName.includes('treatment-plan') || baseName.includes('room') || baseName.includes('operational-room')) {
    resource = 'clinical';
  } else if (baseName.includes('inventory')) {
    resource = 'inventory';
  } else if (baseName.includes('lab-order')) {
    resource = 'lab_orders';
  } else if (baseName.includes('staff')) {
    resource = 'staff';
  } else if (baseName.includes('report') || baseName.includes('analytics') || baseName.includes('audit') || baseName.includes('alert') || baseName.includes('event') || baseName.includes('dashboard') || baseName.includes('query')) {
    resource = 'reports';
  } else if (baseName.includes('setting') || baseName.includes('service')) {
    resource = 'settings';
  }

  let action = 'read';
  const lowerName = functionName.toLowerCase();
  
  if (
    lowerName.startsWith('create') ||
    lowerName.startsWith('add') ||
    lowerName.startsWith('record') ||
    lowerName.startsWith('generate') ||
    lowerName.startsWith('submit') ||
    lowerName.startsWith('invite') ||
    lowerName.startsWith('upload')
  ) {
    action = 'create';
  } else if (
    lowerName.startsWith('update') ||
    lowerName.startsWith('edit') ||
    lowerName.startsWith('cancel') ||
    lowerName.startsWith('change') ||
    lowerName.startsWith('modify') ||
    lowerName.startsWith('set') ||
    lowerName.startsWith('save') ||
    lowerName.startsWith('assign') ||
    lowerName.startsWith('deduct') ||
    lowerName.startsWith('replay') ||
    lowerName.startsWith('void')
  ) {
    action = 'update';
  } else if (
    lowerName.startsWith('delete') ||
    lowerName.startsWith('remove')
  ) {
    action = 'delete';
  } else if (
    lowerName.startsWith('get') ||
    lowerName.startsWith('fetch') ||
    lowerName.startsWith('list') ||
    lowerName.startsWith('load') ||
    lowerName.startsWith('export')
  ) {
    action = 'read';
  }

  // Reports resource only supports 'read' action
  if (resource === 'reports') {
    action = 'read';
  }

  return { resource, action };
}

function processFile(filePath, dryRun = true) {
  const fileName = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  console.log(`\n========================================\nProcessing: ${fileName}\n========================================`);

  // Skip settings.ts since we refactored it manually
  if (fileName === 'settings.ts') {
    console.log(`Skipping manual refactored settings.ts`);
    return;
  }

  // Clean up getUserPermissions in operational-rooms.ts
  if (fileName === 'operational-rooms.ts') {
    content = content.replace(/import\s*\{\s*getUserPermissions\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
    content = content.replace(/const\s+permissions\s+=\s+await\s+getUserPermissions\(\);?\n?/g, '');
    content = content.replace(/if\s*\(!permissions\.has\(PermissionCode\.[A-Z_]+\)\)\s*\{\s*throw\s+new\s+Error\("[^"]+"\);\s*\}\n?/g, '');
  }

  // 1. Clean up imports
  // Remove requirePermission import
  content = content.replace(/import\s*\{\s*requirePermission\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  // Remove PermissionCode import
  content = content.replace(/import\s*\{\s*PermissionCode\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  // Remove resolveTenantContext imports
  content = content.replace(/import\s*\{\s*resolveTenantContextOrRedirect\s*(?:as\s+\w+)?\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  content = content.replace(/import\s*\{\s*resolveTenantContext\s*(?:as\s+\w+)?\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');

  // Add withPermission import if not present
  if (!content.includes('import { withPermission }')) {
    if (content.includes('use server')) {
      content = content.replace(/['"]use server['"];?\n?/g, "'use server'\n\nimport { withPermission } from \"@/lib/rbac/guard\";\n");
    } else {
      content = "import { withPermission } from \"@/lib/rbac/guard\";\n" + content;
    }
  }

  // Helper function replacements for reports.ts, analytics.ts, and treasury.ts using precise patterns
  if (fileName === 'reports.ts') {
    const getTenantRegex = /async\s+function\s+getTenant\(\)[\s\S]*?\{\s*const\s*\{\s*tenantId\s*\}\s*=\s*await\s*resolveTenantContext\(\);[\s\S]*?return\s*tenantId;\s*\}/g;
    if (content.match(getTenantRegex)) {
      content = content.replace(getTenantRegex, `async function getTenant() {
  return withPermission('reports', 'read', async (session) => {
    return session.tenantId;
  });
}`);
      console.log(`Updated getTenant helper in reports.ts`);
    }
  }

  if (fileName === 'analytics.ts') {
    const getAuthorizedTenantIdRegex = /async\s+function\s+getAuthorizedTenantId\(\)[\s\S]*?\{\s*await\s*requirePermission[\s\S]*?return\s*tenantId;\s*\}/g;
    if (content.match(getAuthorizedTenantIdRegex)) {
      content = content.replace(getAuthorizedTenantIdRegex, `async function getAuthorizedTenantId(): Promise<string> {
  return withPermission('reports', 'read', async (session) => {
    return session.tenantId;
  });
}`);
      console.log(`Updated getAuthorizedTenantId helper in analytics.ts`);
    }
  }

  if (fileName === 'treasury.ts') {
    const getTenantRegex = /async\s+function\s+getTenant\(\)[\s\S]*?\{\s*const\s*\{\s*tenantId\s*\}\s*=\s*await\s*resolveTenantContext\(\);[\s\S]*?return\s*tenantId;\s*\}/g;
    if (content.match(getTenantRegex)) {
      content = content.replace(getTenantRegex, `async function getTenant() {
  return withPermission('billing', 'read', async (session) => {
    return session.tenantId;
  });
}`);
      console.log(`Updated getTenant helper in treasury.ts`);
    }
  }

  // 2. Identify and wrap functions
  // We look for exported functions:
  // - A: export async function name(...) { ... }
  // - B: export const name = wrapAction('...', async (...) => { ... })
  // - C: export const name = cache(async (...) => { ... })

  let modifiedCount = 0;
  
  // A. Wrap standard export async function
  // Match pattern: export async function name(args) { try { ... } catch (e) { ... } } OR without try/catch
  const asyncFnRegex = /export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{([\s\S]*?)\n\}/g;
  
  content = content.replace(asyncFnRegex, (match, funcName, args, body) => {
    // Skip helper functions or files that rely purely on helpers
    if (fileName === 'reports.ts' || fileName === 'analytics.ts' || fileName === 'treasury.ts' || funcName === 'getTenant' || funcName === 'getAuthorizedTenantId' || body.includes('withPermission')) {
      return match;
    }

    const { resource, action } = getResourceAndAction(fileName, funcName);
    if (!resource) {
      console.warn(`[WARNING] No resource mapped for function ${funcName} in ${fileName}`);
      return match;
    }

    console.log(`Wrapping async function: ${funcName} -> withPermission('${resource}', '${action}')`);
    modifiedCount++;

    // Let's check if the body has a try/catch block
    const trimmedBody = body.trim();
    if (trimmedBody.startsWith('try {')) {
      const tryMatch = body.match(/try\s*\{([\s\S]*?)\}\s*catch\s*\(([^)]+)\)\s*\{([\s\S]*)\}/);
      if (tryMatch) {
        const tryBody = tryMatch[1];
        const catchVar = tryMatch[2];
        const catchBody = tryMatch[3];

        // Clean up requirePermission/resolveTenantContext inside tryBody
        let cleanedTryBody = tryBody
          .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
          .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
          .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

        // Apply type-compatible return properties for success/error
        cleanedTryBody = cleanedTryBody
          .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
          .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
          .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

        const cleanedCatchBody = catchBody
          .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
          .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
          .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

        return `export async function ${funcName}(${args}) {
  try {
    return await withPermission('${resource}', '${action}', async (session) => {
      const tenantId = session.tenantId;
      ${cleanedTryBody.trim().split('\n').join('\n      ')}
    });
  } catch (${catchVar}) {
    ${cleanedCatchBody.trim().split('\n').join('\n    ')}
  }
}`;
      }
    }

    // No try/catch at top level
    let cleanedBody = body
      .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

    cleanedBody = cleanedBody
      .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
      .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
      .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

    return `export async function ${funcName}(${args}) {
  return withPermission('${resource}', '${action}', async (session) => {
    const tenantId = session.tenantId;
    ${cleanedBody.trim().split('\n').join('\n    ')}
  });
}`;
  });

  // B. Wrap wrapAction calls (precisely matches wrapAction with module metadata parameter to prevent nested early closures)
  const wrapActionRegex = /export\s+const\s+(\w+)\s*=\s*wrapAction\(\s*['"]([^'"]+)['"]\s*,\s*async\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*,\s*(\{\s*module:[\s\S]*?\}\s*)\);/g;

  content = content.replace(wrapActionRegex, (match, constName, eventName, args, body, metadata) => {
    if (fileName === 'reports.ts' || fileName === 'analytics.ts' || fileName === 'treasury.ts' || body.includes('withPermission')) return match;

    const { resource, action } = getResourceAndAction(fileName, constName);
    if (!resource) {
      console.warn(`[WARNING] No resource mapped for wrapAction ${constName} in ${fileName}`);
      return match;
    }

    console.log(`Wrapping wrapAction: ${constName} -> withPermission('${resource}', '${action}')`);
    modifiedCount++;

    let cleanedBody = body
      .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

    cleanedBody = cleanedBody
      .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
      .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
      .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

    return `export const ${constName} = wrapAction(
  '${eventName}',
  async (${args}) => {
    return withPermission('${resource}', '${action}', async (session) => {
      const tenantId = session.tenantId;
      ${cleanedBody.trim().split('\n').join('\n      ')}
    });
  },
  ${metadata.trim()}
);`;
  });

  // Also catch wrapAction where args does not have parentheses, e.g. async id => { ... }
  const wrapActionSingleArgRegex = /export\s+const\s+(\w+)\s*=\s*wrapAction\(\s*['"]([^'"]+)['"]\s*,\s*async\s+(\w+)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*,\s*(\{\s*module:[\s\S]*?\}\s*)\);/g;

  content = content.replace(wrapActionSingleArgRegex, (match, constName, eventName, argName, body, metadata) => {
    if (fileName === 'reports.ts' || fileName === 'analytics.ts' || fileName === 'treasury.ts' || body.includes('withPermission')) return match;

    const { resource, action } = getResourceAndAction(fileName, constName);
    if (!resource) {
      console.warn(`[WARNING] No resource mapped for wrapAction ${constName} in ${fileName}`);
      return match;
    }

    console.log(`Wrapping wrapAction (single arg): ${constName} -> withPermission('${resource}', '${action}')`);
    modifiedCount++;

    let cleanedBody = body
      .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

    cleanedBody = cleanedBody
      .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
      .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
      .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

    return `export const ${constName} = wrapAction(
  '${eventName}',
  async (${argName}) => {
    return withPermission('${resource}', '${action}', async (session) => {
      const tenantId = session.tenantId;
      ${cleanedBody.trim().split('\n').join('\n      ')}
    });
  },
  ${metadata.trim()}
);`;
  });

  // C. Wrap cache(async ...) calls
  // Match pattern: export const name = cache(async (args) => { ... })
  const cacheRegex = /export\s+const\s+(\w+)\s*=\s*cache\(\s*async\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*\);/g;

  content = content.replace(cacheRegex, (match, constName, args, body) => {
    if (fileName === 'reports.ts' || fileName === 'analytics.ts' || fileName === 'treasury.ts' || body.includes('withPermission')) return match;

    const { resource, action } = getResourceAndAction(fileName, constName);
    if (!resource) {
      console.warn(`[WARNING] No resource mapped for cache function ${constName} in ${fileName}`);
      return match;
    }

    console.log(`Wrapping cache function: ${constName} -> withPermission('${resource}', '${action}')`);
    modifiedCount++;

    // Let's check if the body has a try/catch block
    const trimmedBody = body.trim();
    if (trimmedBody.startsWith('try {')) {
      const tryMatch = body.match(/try\s*\{([\s\S]*?)\}\s*catch\s*\(([^)]+)\)\s*\{([\s\S]*)\}/);
      if (tryMatch) {
        const tryBody = tryMatch[1];
        const catchVar = tryMatch[2];
        const catchBody = tryMatch[3];

        let cleanedTryBody = tryBody
          .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
          .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
          .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

        cleanedTryBody = cleanedTryBody
          .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
          .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
          .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

        const cleanedCatchBody = catchBody
          .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
          .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
          .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

        return `export const ${constName} = cache(async (${args}) => {
  try {
    return await withPermission('${resource}', '${action}', async (session) => {
      const tenantId = session.tenantId;
      ${cleanedTryBody.trim().split('\n').join('\n      ')}
    });
  } catch (${catchVar}) {
    ${cleanedCatchBody.trim().split('\n').join('\n    ')}
  }
});`;
      }
    }

    let cleanedBody = body
      .replace(/await\s+requirePermission\([^)]+\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*\{\s*tenantId\s*\}\s*=\s*await\s*(?:resolveTenantContext|getTenantContext|resolveTenantContextOrRedirect)\(\);?\n?/g, '')
      .replace(/(?:const|let|var)\s*tenantId\s*=\s*ctx\.tenantId;?\n?/g, '');

    cleanedBody = cleanedBody
      .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
      .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
      .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

    return `export const ${constName} = cache(async (${args}) => {
  return withPermission('${resource}', '${action}', async (session) => {
    const tenantId = session.tenantId;
    ${cleanedBody.trim().split('\n').join('\n    ')}
  });
});`;
  });

  // Global replacements for remaining success responses
  content = content
    .replace(/success:\s*true,\s*data/g, 'success: true, error: undefined, data')
    .replace(/success:\s*true(?!,\s*error)/g, 'success: true, error: undefined')
    .replace(/success:\s*false,\s*error:\s*("[^"]*"|'[^']*'|`[^`]*`|[^,}]+)(?!.*data)/g, 'success: false, data: undefined, error: $1')
    .replace(/success:\s*false(?!.*data)/g, 'success: false, data: undefined');

  if (modifiedCount > 0 || originalContent !== content) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Successfully wrote updates to ${fileName}`);
    } else {
      console.log(`Dry run: would update ${fileName}`);
    }
  } else {
    console.log(`No changes needed in ${fileName}`);
  }
}

// Run processing
const dryRun = process.argv.includes('--write') ? false : true;

if (dryRun) {
  console.log("RUNNING IN DRY-RUN MODE. Pass '--write' flag to apply changes.");
} else {
  console.log("RUNNING IN WRITE MODE. Applying changes to files.");
}

// Process all actions files
FILES_TO_PROCESS.forEach(fileName => {
  const filePath = path.join(actionsDir, fileName);
  if (fs.existsSync(filePath)) {
    processFile(filePath, dryRun);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

// Also process query.ts specifically
if (fs.existsSync(queryFilePath)) {
  processFile(queryFilePath, dryRun);
} else {
  console.warn(`File not found: ${queryFilePath}`);
}
