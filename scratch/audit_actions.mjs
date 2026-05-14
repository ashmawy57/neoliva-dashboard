
import fs from 'fs';
import path from 'path';

const actionsDir = 'd:/DENTAL CLINIC DASHBOARD/src/app/actions';
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

const IGNORED_FILES = ['auth.ts', 'signout.ts', 'password-reset.ts'];

for (const file of files) {
  if (IGNORED_FILES.includes(file)) continue;
  
  const content = fs.readFileSync(path.join(actionsDir, file), 'utf-8');
  const lines = content.split('\n');
  
  let currentFunction = '';
  let hasPermissionCheck = false;
  let inFunction = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Simple regex to match exported async functions
    const funcMatch = line.match(/export async function (\w+)/);
    if (funcMatch) {
      if (inFunction && !hasPermissionCheck && currentFunction) {
        console.log(`MISSING: ${file} -> ${currentFunction}`);
      }
      currentFunction = funcMatch[1];
      hasPermissionCheck = false;
      inFunction = true;
      continue;
    }
    
    if (inFunction) {
      if (line.includes('requirePermission')) {
        hasPermissionCheck = true;
      }
      
      // If we see another export or end of file, check the previous function
      if (line.startsWith('export') || i === lines.length - 1) {
        if (!hasPermissionCheck && currentFunction) {
          console.log(`MISSING: ${file} -> ${currentFunction}`);
        }
        inFunction = false;
        currentFunction = '';
      }
    }
  }
}
