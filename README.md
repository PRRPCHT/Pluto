![](public/pluto.webp)

# Pluto

What's Pluto? It's yet another static gallery website builder, based on [Astro](https://astro.build/).

## How to use Pluto

### Get the code

Run `git clone https://github.com/PRRPCHT/Pluto.git` to get Pluto's code on your computer. Then in your favorite terminal navigate into this Pluto folder and run `npm install` in order to install the needed dependencies. NodeJs is required.

### Configure Pluto

#### Set the images up

The images to appear in your gallery must be located in the `public/gallery` folder. We recommend exporting your images in a web-friendly format. Pluto has a folder based navigation. While it is possible to just copy a lot of images in the gallery folder and call it a day, we recommend having a proper folder hierarchy.

#### Set the configuration (optional)

The `pluto-config.json` file helps customizing your gallery.

- `gallery_name`: gives a custom name to your gallery. Otherwise, _Pluto_ is being used.
- `gallery_alignment`: defines the alignment of the images in the gallery. Possible values: `left`, `center`, `right`.
- `description_position`: defines the position of the description, above or below the images.
- `description_alignment`: defines the alignment of the description in the gallery. Possible values: `left`, `center`, `right`.

#### Set the descriptions (optional)

Each folder can contain a `gallery.md` file. Using [markdown](https://www.markdownguide.org/) you can describe what's displayed in the folder. If no description is provided, nothing is displayed.

### Make the gallery

Run `npm run build --release` to make your gallery. The result will be available in the `dist` folder. Copy the content of this folder to your web server... and enjoy!
