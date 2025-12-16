import * as fs from 'fs'; // Import the original fs module for streams
import * as fsPromises from 'fs/promises'; // Import fs.promises for async/await
import * as path from 'path';

// Path to the .next static css directory
const cssDir = path.join(process.cwd(), 'public', 'styles');

// Output path for the combined CSS file
const outputPath = path.join(process.cwd(), 'public', 'site.css');

// Main function to combine CSS files
async function concatCss() {
    try {
        // Read all files in the .next/static/css/ directory
        const files = await fsPromises.readdir(cssDir);

        // Filter the CSS files (only .css files)
        const cssFiles = files.filter((file) => file.endsWith('.css'));

        if (cssFiles.length === 0) {
            console.error('No CSS files found in .next/static/css/');
            process.exit(1);
        }

        // Create a writable stream for the output file using fs (not fs.promises)
        const outputStream = fs.createWriteStream(outputPath);

        // Loop through each CSS file and append its content to the output file
        for (let index = 0; index < cssFiles.length; index++) {
            const file = cssFiles[index];
            const filePath = path.join(cssDir, file);
            const fileContent = await fsPromises.readFile(filePath, 'utf8'); // Read file content asynchronously

            // If it's not the first file, add a line break between files
            if (index !== 0) {
                outputStream.write('\n');
            }

            // Write the content of the current file to the output file
            outputStream.write(fileContent);
        }

        outputStream.end(() => {
            console.log(`Successfully combined CSS files into ${outputPath}`);
        });
    } catch (err) {
        console.error('Error reading the CSS directory or writing the output file:', err);
        process.exit(1);
    }
}

// Call the concatCss function
concatCss();
