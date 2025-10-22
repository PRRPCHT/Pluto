import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import * as Utils from '../src/utils/utils';

const THUMBNAIL_ROOT = 'public/thumbnails';
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 400;

/**
 * Check if a file is an image based on its extension
 * @param filename - The name of the file to check
 * @returns True if the file is an image, false otherwise
 */
function isImage(filename: string): boolean {
	const ext = path.extname(filename).toLowerCase();
	return Utils.IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Get the first image in a folder (for thumbnail)
 * @param folderPath - The path to the folder to search
 * @returns The path to the first image in the folder, or undefined if no image is found
 */
function getFirstImage(folderPath: string): string | undefined {
	try {
		const items = fs.readdirSync(folderPath);
		for (const item of items) {
			const itemPath = path.join(folderPath, item);
			const stat = fs.statSync(itemPath);

			if (stat.isFile() && isImage(item)) {
				return item;
			}

			// Recursively check subfolders
			if (stat.isDirectory()) {
				const subImage = getFirstImage(itemPath);
				if (subImage) {
					return path.join(item, subImage);
				}
			}
		}
	} catch (error) {
		console.error(`Error reading folder ${folderPath}:`, error);
	}
	return undefined;
}

/**
 * Generate thumbnail for an image
 * @param sourcePath - The path to the source image
 * @param destPath - The path to the output thumbnail
 * @returns A promise that resolves when the thumbnail is generated
 */
async function generateThumbnail(sourcePath: string, destPath: string): Promise<void> {
	try {
		// Ensure destination directory exists
		const destDir = path.dirname(destPath);
		if (!fs.existsSync(destDir)) {
			fs.mkdirSync(destDir, { recursive: true });
		}

		// Generate thumbnail
		await sharp(sourcePath)
			.resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 85 }) // Convert to JPEG for consistent format
			.toFile(destPath);

		console.log(`Generated thumbnail: ${destPath}`);
	} catch (error) {
		console.error(`Error generating thumbnail for ${sourcePath}:`, error);
	}
}

/**
 * Scan directory and generate thumbnails for all folders
 * @param dirPath - The path to the directory to scan
 * @param relativePath - The relative path to the directory
 * @returns A promise that resolves when all thumbnails are generated
 */
async function scanAndGenerateThumbnails(
	dirPath: string,
	relativePath: string = ''
): Promise<void> {
	try {
		const items = fs.readdirSync(dirPath);

		for (const item of items) {
			const fullPath = path.join(dirPath, item);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				// Get first image in this folder
				const firstImage = getFirstImage(fullPath);

				if (firstImage) {
					// Generate thumbnail path
					const sourceImagePath = path.join(fullPath, firstImage);
					const thumbnailRelativePath = relativePath ? `${relativePath}/${item}` : item;
					const thumbnailPath = path.join(THUMBNAIL_ROOT, thumbnailRelativePath + '.jpg');

					// Check if thumbnail already exists and is newer than source
					let shouldGenerate = true;
					if (fs.existsSync(thumbnailPath)) {
						const sourceStat = fs.statSync(sourceImagePath);
						const thumbStat = fs.statSync(thumbnailPath);
						shouldGenerate = sourceStat.mtime > thumbStat.mtime;
					}

					if (shouldGenerate) {
						await generateThumbnail(sourceImagePath, thumbnailPath);
					} else {
						console.log(`Skipped (up-to-date): ${thumbnailPath}`);
					}
				}

				// Recursively scan subdirectories
				const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
				await scanAndGenerateThumbnails(fullPath, newRelativePath);
			}
		}
	} catch (error) {
		console.error(`Error scanning directory ${dirPath}:`, error);
	}
}

/**
 * Main function
 * @returns A promise that resolves when all thumbnails are generated
 */
async function main() {
	console.log('Generating thumbnails...\n');

	// Ensure thumbnail root exists
	if (!fs.existsSync(THUMBNAIL_ROOT)) {
		fs.mkdirSync(THUMBNAIL_ROOT, { recursive: true });
	}

	if (fs.existsSync(Utils.GALLERY_ROOT)) {
		await scanAndGenerateThumbnails(Utils.GALLERY_ROOT);
		console.log('Thumbnail generation complete!');
	} else {
		console.error(`Gallery root "${Utils.GALLERY_ROOT}" does not exist.`);
		process.exit(1);
	}
}

main();
