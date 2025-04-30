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

// --- Helper function to derive canonical path ---
function getCanonicalPathFromFile(absoluteFilePath, buildDir) {
    let relativePath = path.relative(buildDir, absoluteFilePath);
    let canonicalPath = '';

    if (relativePath.startsWith('server/pages/')) {
        canonicalPath = relativePath.substring('server/pages'.length);
        if (canonicalPath.endsWith('/index.html')) {
            canonicalPath = canonicalPath.slice(0, -'index.html'.length) || '/';
        } else if (canonicalPath.endsWith('.html')) {
            canonicalPath = canonicalPath.slice(0, -'.html'.length);
        }
    } else if (relativePath.startsWith('server/app/')) {
        canonicalPath = relativePath.substring('server/app'.length);
        if (canonicalPath.endsWith('/page.html')) {
            canonicalPath = canonicalPath.slice(0, -'page.html'.length);
        }
        // Remove potential route groups like /(marketing)/ or /@(auth)/
        canonicalPath = canonicalPath.replace(/\/\([^\)]+\)/g, '');
        // Remove trailing slash if not root
        if (canonicalPath.length > 1 && canonicalPath.endsWith('/')) {
            canonicalPath = canonicalPath.slice(0, -1);
        }
    }

    // Ensure leading slash
    return canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath;
}
// -----------------------------------------------

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
            // --- Derive and pass current page path ---
            const currentPagePath = getCanonicalPathFromFile(file, buildDir);
            const result = processInternalLinks(content, config, currentPagePath);
            // -----------------------------------------

            // Only write back if changes were made
            if (content !== result.processedHtml) {
                await fs.writeFile(file, result.processedHtml, 'utf-8');
                processedCount++;
                const relativePath = path.relative(process.cwd(), file);
                // Log updated file path and the keywords linked within it
                console.log(`  -> Updated links in: ${relativePath}`);
                if (result.linkedKeywords.length > 0) {
                    console.log(`     Keywords linked: ${result.linkedKeywords.join(', ')}`);
                } else {
                    console.log(`     (Content changed, but no keywords linked - likely self-link prevented)`); // Updated log
                }
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