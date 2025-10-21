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
- `gallery_style`: defines the style of the gallery: thumbnails vs large images. Possible values: `large`, `thumbnails`.
- `description_position`: defines the position of the description, above or below the images.
- `description_alignment`: defines the alignment of the description in the gallery. Possible values: `left`, `center`, `right`.
- `base_path` (optional): defines the base path when deploying to a subdirectory (e.g., `/photos`). If your site is hosted at `https://example.com/photos`, set this to `/photos`. Default is `/` (root).

#### Set the descriptions (optional)

Each folder can contain a `gallery.md` file. Using [markdown](https://www.markdownguide.org/) you can describe what's displayed in the folder. If no description is provided, nothing is displayed.

### Make the gallery

Run `npm run build --release` to make your gallery. The result will be available in the `dist` folder. Copy the content of this folder to your web server... and enjoy!

## Security & privacy aspects

### Security

Pluto **doesn't** provide any security feature e.g. login, rights, groups... It's however posible to leverage your web server's basic authentication system to protect the access to your galleries. Here's an example for running on an Apache server:

1. Create a `.htpasswd` file in the `public` folder. This file will contain the logins and the passwords of the users that can log in and see your images. There are several online password generators such as [this one](https://hostingcanada.org/htpasswd-generator/) that uses bcrypt.
   Your .htpasswd should look like this:
   ```
   pierre:$2y$10$mkzHGvShweaLccauQsE4tO33TdAmed0LZ4LYpSG82ryzYopIYM5tm
   sophie:$2y$10$R99Z9kj0GmriTQZ/M4i0Z.Kd8BbcSItiwGb1Kf2k7pp8nOQ.EZNAO
   ```
2. Create a `.htaccess` file in the `public` folder that will restrict all access to your gallery:
   ```
   AuthType Basic
   AuthName "Restricted Galleries"
   AuthUserFile /.htpasswd
   Require valid-user
   ```

This way your images won't be reachable by anyone.

### Privacy

Pluto comes by default with a `robots.txt` in the `public` folder that block search engines to give a look at your images. Remove or edit this file to change its policies. Your gallery still remain opened to anyone if not protected by a password.
