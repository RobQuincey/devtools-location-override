const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Files and folders to exclude from the Chrome Web Store package
const excludePatterns = [
    'node_modules',
    'scripts',
    'dist',
    '.git',
    '.gitignore',
    'package.json',
    'package-lock.json',
    'README.md',
    'STORE_LISTING.md',
    'PRIVACY.md',
    'QUICKSTART.md',
    '*.md'
];

async function createChromePackage() {
    try {
        // Ensure dist directory exists
        const distDir = path.join(__dirname, '..', 'dist');
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
        }

        // Read package.json for version
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
        const version = packageJson.version;
        
        const outputPath = path.join(distDir, `devtools-location-override-${version}.zip`);
        const output = fs.createWriteStream(outputPath);
        const archive = new archiver.ZipArchive({
        zlib: { level: 9 },
        });
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                console.log(`✅ Chrome Web Store package created: ${outputPath}`);
                console.log(`📦 Total bytes: ${archive.pointer()}`);
                resolve();
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);

            // Add files to archive
            const sourceDir = path.join(__dirname, '..');
            
            function shouldExclude(filePath) {
                const relativePath = path.relative(sourceDir, filePath);
                return excludePatterns.some(pattern => {
                    if (pattern.includes('*')) {
                        return relativePath.match(pattern.replace('*', '.*'));
                    }
                    return relativePath.startsWith(pattern) || relativePath === pattern;
                });
            }

            function addDirectory(dirPath, archivePath = '') {
                const files = fs.readdirSync(dirPath);
                
                files.forEach(file => {
                    const fullPath = path.join(dirPath, file);
                    const archiveFilePath = path.join(archivePath, file);
                    
                    if (shouldExclude(fullPath)) {
                        console.log(`⏭️  Excluding: ${archiveFilePath}`);
                        return;
                    }
                    
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        addDirectory(fullPath, archiveFilePath);
                    } else {
                        console.log(`📄 Adding: ${archiveFilePath}`);
                        archive.file(fullPath, { name: archiveFilePath });
                    }
                });
            }

            addDirectory(sourceDir);
            archive.finalize();
        });
    } catch (error) {
        console.error('❌ Error creating package:', error);
        process.exit(1);
    }
}

createChromePackage();
