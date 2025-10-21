import * as fs from 'fs';
import * as path from 'path';

export interface GalleryItem {
	name: string;
	path: string;
	isFolder: boolean;
	thumbnail?: string;
	count?: number;
}

export interface GalleryData {
	currentPath: string;
	description: string;
	folders: GalleryItem[];
	images: GalleryItem[];
	parentPath: string | null;
	breadcrumbs: { name: string; path: string }[];
	imagesCount: number;
}

export enum GalleryElementAlignment {
	Center = 'center',
	Left = 'left',
	Right = 'right'
}
export enum DescriptionPosition {
	Top = 'top',
	Bottom = 'bottom'
}

export interface GalleryConfig {
	gallery_name: string;
	gallery_alignment: GalleryElementAlignment;
	description_position: DescriptionPosition;
	description_alignment: GalleryElementAlignment;
}

const GALLERY_ROOT = 'public/galleries';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Check if a file is an image based on its extension
 */
function isImage(filename: string): boolean {
	const ext = path.extname(filename).toLowerCase();
	return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Get the first image in a folder (for thumbnail)
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
 * Get the number of images in a folder
 */
function getImageCount(folderPath: string): number {
	try {
		const items = fs.readdirSync(folderPath);
		const directImageCount = items.filter((item) => isImage(item)).length;
		const recursiveImageCount = items
			.filter((item) => fs.statSync(path.join(folderPath, item)).isDirectory())
			.reduce((acc, item) => acc + getImageCount(path.join(folderPath, item)), 0);
		return directImageCount + recursiveImageCount;
	} catch (error) {
		console.error(`Error reading folder ${folderPath}:`, error);
	}
	return 0;
}

/**
 * Get all possible gallery paths for static generation
 */
export function getAllGalleryPaths(basePath: string = GALLERY_ROOT): string[] {
	const paths: string[] = ['/']; // Root gallery path

	function scanDirectory(dirPath: string, relativePath: string = '') {
		try {
			const items = fs.readdirSync(dirPath);

			for (const item of items) {
				const fullPath = path.join(dirPath, item);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
					paths.push(`/${newRelativePath}`);
					scanDirectory(fullPath, newRelativePath);
				}
			}
		} catch (error) {
			console.error(`Error scanning directory ${dirPath}:`, error);
		}
	}

	if (fs.existsSync(basePath)) {
		scanDirectory(basePath);
	}

	return paths;
}

/**
 * Get the gallery config
 */
export function getGalleryConfig(): GalleryConfig {
	try {
		return JSON.parse(fs.readFileSync('pluto-config.json', 'utf8')) as GalleryConfig;
	} catch (error) {
		console.error(`Error reading gallery config file pluto-config.json}:`, error);
		return {
			gallery_name: 'Pluto',
			gallery_alignment: GalleryElementAlignment.Center,
			description_position: DescriptionPosition.Top,
			description_alignment: GalleryElementAlignment.Center
		} as GalleryConfig;
	}
}

/**
 * Get gallery data for a specific path
 */
export function getGalleryData(galleryPath: string): GalleryData {
	// Clean up the path
	const cleanPath = galleryPath === '/' ? '' : galleryPath.replace(/^\/|\/$/g, '');
	const fullPath = path.join(GALLERY_ROOT, cleanPath);

	const folders: GalleryItem[] = [];
	const images: GalleryItem[] = [];
	let description = '';
	let imagesCount = 0;
	// Read directory contents
	if (fs.existsSync(fullPath)) {
		try {
			const items = fs.readdirSync(fullPath);

			for (const item of items) {
				const itemPath = path.join(fullPath, item);
				const stat = fs.statSync(itemPath);

				if (stat.isDirectory()) {
					const thumbnail = getFirstImage(itemPath);
					const relativePath = cleanPath ? `${cleanPath}/${item}` : item;
					const count = getImageCount(itemPath);
					imagesCount += count || 0;

					folders.push({
						name: item,
						path: `/${relativePath}`,
						isFolder: true,
						thumbnail: thumbnail ? `/galleries/${relativePath}/${thumbnail}` : undefined,
						count: count || 0
					});
				} else if (stat.isFile() && isImage(item)) {
					const relativePath = cleanPath ? `${cleanPath}/${item}` : item;

					images.push({
						name: item,
						path: `/galleries/${relativePath}`,
						isFolder: false
					});
				} else if (stat.isFile() && item.toLowerCase() === 'gallery.md') {
					const relativePath = cleanPath ? `${cleanPath}/${item}` : item;
					description = fs.readFileSync(itemPath, 'utf8');
				}
			}
		} catch (error) {
			console.error(`Error reading gallery path ${fullPath}:`, error);
		}
	}

	// Sort folders and images alphabetically
	folders.sort((a, b) => a.name.localeCompare(b.name));
	images.sort((a, b) => a.name.localeCompare(b.name));
	imagesCount = images.length;

	// Calculate parent path
	let parentPath: string | null = null;
	if (cleanPath) {
		const pathParts = cleanPath.split('/');
		pathParts.pop();
		parentPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
	}

	// Generate breadcrumbs
	const breadcrumbs: { name: string; path: string }[] = [{ name: 'Gallery', path: '/' }];

	if (cleanPath) {
		const pathParts = cleanPath.split('/');
		let currentPath = '';

		for (const part of pathParts) {
			currentPath += (currentPath ? '/' : '') + part;
			breadcrumbs.push({
				name: part,
				path: `/${currentPath}`
			});
		}
	}

	return {
		currentPath: galleryPath,
		description,
		folders,
		images,
		parentPath,
		breadcrumbs,
		imagesCount
	};
}
