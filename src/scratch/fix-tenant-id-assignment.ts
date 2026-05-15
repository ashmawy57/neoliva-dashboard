import fs from 'fs';
import path from 'path';

const actionsDir = path.join(process.cwd(), 'src', 'app', 'actions');

function fixFile(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: const tenantId = await resolveTenantContext();
    const pattern1 = /const tenantId = await resolveTenantContext\(\);/g;
    const replacement1 = 'const { tenantId } = await resolveTenantContext();';
    
    // Pattern 2: const tenantId = await resolveTenantContext() (no semicolon)
    const pattern2 = /const tenantId = await resolveTenantContext\(\)/g;
    const replacement2 = 'const { tenantId } = await resolveTenantContext()';

    // Pattern 3: let tenantId = await resolveTenantContext();
    const pattern3 = /let tenantId = await resolveTenantContext\(\);/g;
    const replacement3 = 'let { tenantId } = await resolveTenantContext();';

    let newContent = content
        .replace(pattern1, replacement1)
        .replace(pattern2, replacement2)
        .replace(pattern3, replacement3);

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function processDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fixFile(fullPath);
        }
    }
}

processDir(actionsDir);
console.log('Finished fixing tenantId assignments in actions directory.');
