# For Jade

Minimalist birthday site. Next.js (App Router) on Vercel, content in Supabase, no visitor login.

## Run it
1. `cp .env.example .env.local` and fill in `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard > Project Settings > API Keys > secret key) and `PRIVATE_SESSION_SECRET` (any random string of 16+ characters; for example run `openssl rand -base64 32`).
2. `npm install`
3. `npm run set-admin-password` (sets the admin CMS password)
4. `npm run set-password` (sets the password for "Just Between Us")
5. `npm run dev`, then open http://localhost:3000

## Admin CMS
Open `http://localhost:3000/admin/login` and sign in with the admin password set above. After signing in, use the sidebar to manage content. Create or edit an item, save it, then make sure it is published for it to appear on the public site. The admin area also has site settings, page audio, finale content, and a media library.

## Pages
| Address | What it is | Reads from |
| --- | --- | --- |
| `/` | Opening lines type out, a plain envelope, the letter types out | `site_settings` |
| `/cake` | Five candles. When the last is out the room goes dark and the message types | `site_settings.cake_message` |
| `/hub` | Her name, your message, a list of the sections (with "visited" marks on this device) | `site_settings` |
| `/universe` | Tap a title, the memory opens and types | `universe_cards` |
| `/memories` | Photos full width, notes, memory cards, the timeline, the ordinary things | `memories`, `timeline_entries`, `ordinary_things` |
| `/letters` | A list of letters. Opening one types it out, paragraph by paragraph | `letters` |
| `/people` | Friends' videos by collection. Your own video sits last | `friends` |
| `/little-things` | Tap a line, what is behind it types | `little_things` |
| `/just-between-us` | Password gate, then private letters | `private_gate`, `private_letters` (server only) |
| `/finale` | The closing letter | `finale` |

## Where things live
- **Words**: Supabase table editor. A row only shows on the site when `published` is on. Order with `sort_order`.
- **Pictures, songs, videos**: Storage bucket `jade-media`. Put the file path in the row, e.g. `photos/beach.jpg`. Compress videos to MP4 first.
- **Song and pen sound for each page**: table `page_settings` (`slug`, `song_path`, `song_volume` 0 to 1, `scribble_enabled`). Slugs: `portal` (the cake keeps the portal's song), `hub`, `universe`, `memories`, `letters`, `people`, `little`, `private`, `finale`.
- **Private section**: tables `private_letters` and `private_gate`, and bucket `jade-private` for its photos. Visitors cannot read any of them. Only the server can.

## How the private section stays private
The password is checked on the server against a bcrypt hash. Only after it matches does the server set a signed, `httpOnly` cookie (valid 12 hours, only for `/just-between-us`). The private letters are loaded on the server after that check, so they are never part of the public pages. Photos in `jade-private` are served through links that expire after an hour.

## Look and feel
No cards, no rounded corners, no glow. Pictures run edge to edge, words sit in one column, thin lines divide things. The only hover effect is a slow zoom on pictures, on a computer with a mouse. Text types itself with a soft pen sound (generated in the browser). Tap while it types to show the rest at once. Reduced-motion settings turn the animation off.

## Deploy
Import the repo in Vercel and add the same environment variables. Keep `SUPABASE_SERVICE_ROLE_KEY` and `PRIVATE_SESSION_SECRET` private (no `NEXT_PUBLIC_` prefix). Every page sends `noindex` and `robots.txt` disallows everything; still, use an address she alone has.

## Sound
Browsers only allow sound after the first tap or key press, so the first interaction unlocks it. Songs fade in and out between pages and there is a "sound on / off" control at the top. Use royalty-free tracks if the site is public.

## Not done yet
- No editor. Edit in the Supabase table editor for now.
- Video playback has not been tried with a real file; add one and check it on a phone before the day.
