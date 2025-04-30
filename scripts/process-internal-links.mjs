import fs from 'fs/promises';
import path from 'path';
// Adjust the import path based on your project structure and tsconfig paths
// Assuming direct relative path from scripts/ to lib/
import { loadLinkConfig } from '../lib/internal-linking/dist/config.js'; // Point to dist/
import { processInternalLinks } from '../lib/internal-linking/dist/transform.js'; // Point to dist/

// --- Configuration ---
const buildOutputDir = '.next'; // Default Next.js build output directory
// Target paths from PRD - converted to relative paths within the build output
const targetPaths = [
    'server/pages/ordbog',
    'server/pages/blog',
    'server/pages/mr-scanning.html', // Assuming this is a single file
    'server/app/ordbog', // Add equivalent paths for App Router if used
    'server/app/blog',
    'server/app/mr-scanning/page.html' // Example App Router path
];
const htmlFileExtension = '.html';
// ---------------------

async function findHtmlFiles(dir) {
    let htmlFiles = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                htmlFiles = htmlFiles.concat(await findHtmlFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith(htmlFileExtension)) {
                htmlFiles.push(fullPath);
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Directory doesn't exist, likely no files for this path
            // console.log(`Directory not found, skipping: ${dir}`);
        } else {
            console.error(`Error reading directory ${dir}:`, error);
        }
    }
    return htmlFiles;
}

async function processFiles() {
    console.log('Starting internal link processing...');
    const config = loadLinkConfig();
    let processedCount = 0;
    let filesToProcess = [];

    const buildDir = path.resolve(process.cwd(), buildOutputDir);

    // Collect all potential HTML files from target directories/files
    for (const targetPath of targetPaths) {
        const fullTargetPath = path.join(buildDir, targetPath);
        if (targetPath.endsWith(htmlFileExtension)) {
            // It's a specific file path
            try {
                // Check if file exists before adding
                await fs.access(fullTargetPath);
                filesToProcess.push(fullTargetPath);
            } catch (error) {
                // File doesn't exist, ignore
                // console.log(`Target file not found, skipping: ${fullTargetPath}`);
            }
        } else {
            // It's a directory path
            const files = await findHtmlFiles(fullTargetPath);
            filesToProcess = filesToProcess.concat(files);
        }
    }

    // Deduplicate file paths
    const uniqueFiles = [...new Set(filesToProcess)];

    if (uniqueFiles.length === 0) {
        console.log('No HTML files found in target paths to process.');
        return;
    }

    console.log(`Found ${uniqueFiles.length} HTML files to process in target paths.`);

    for (const file of uniqueFiles) {
        try {
            // console.log(`Processing file: ${file}`);
            const content = await fs.readFile(file, 'utf-8');
            const processedContent = processInternalLinks(content, config);

            // Only write back if changes were made
            if (content !== processedContent) {
                await fs.writeFile(file, processedContent, 'utf-8');
                processedCount++;
                console.log(`  -> Updated links in: ${path.relative(process.cwd(), file)}`);
            }
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }

    console.log(`Internal link processing complete. Updated ${processedCount} files.`);
}

processFiles().catch(error => {
    console.error('Failed to process internal links:', error);
    process.exit(1);
}); 