-- ==============================================================================
-- Seed initial curated artists and songs into InsForge
-- ==============================================================================

INSERT INTO artists (id, name, slug, description, image_url, region, genres, monthly_listeners, verified)
VALUES
('divine', 'DIVINE', 'divine', 'Pioneered the Mumbai gully rap revolution. From JB Nagar to international acclaim.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', 'india', ARRAY['Desi Hip-Hop', 'Gully Rap'], '5.4M', true),
('seedhe-maut', 'Seedhe Maut', 'seedhe-maut', 'The New Delhi duo of Encore ABJ and Calm. Known for lightning-fast flows and intricate internal rhyming.', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop', 'india', ARRAY['Delhi Hip-Hop', 'Drill'], '3.9M', true),
('krsna', 'KR$NA', 'krsna', 'Celebrated for complex schemes, double entendres, relentless punchlines, and supreme technical delivery.', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop', 'india', ARRAY['Desi Hip-Hop', 'Lyrical'], '4.2M', true),
('hanumankind', 'Hanumankind', 'hanumankind', 'Blew past borders with relentless southern energy and international viral dominance with Big Dawgs.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop', 'india', ARRAY['Southern Rap', 'Hardcore Hip-Hop'], '14.8M', true),
('kendrick-lamar', 'Kendrick Lamar', 'kendrick-lamar', 'Pulitzer Prize-winning Compton titan renowned for intricate conceptual albums.', 'https://images.unsplash.com/photo-1549834185-bd9f078a5dfe?q=80&w=1200&auto=format&fit=crop', 'global', ARRAY['West Coast', 'Conscious'], '68.4M', true),
('travis-scott', 'Travis Scott', 'travis-scott', 'Houston sonic architect known for psychedelic trap production and stadium anthems.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop', 'global', ARRAY['Psychedelic Trap', 'Southern'], '64.2M', true)
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description,
image_url = EXCLUDED.image_url,
monthly_listeners = EXCLUDED.monthly_listeners;

INSERT INTO songs (id, title, slug, artist_id, artwork_url, duration_seconds, genre, trending_rank)
VALUES
('ind-01', '3:59 AM', '3-59-am', 'divine', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop', 258, 'Gully Rap', 1),
('ind-02', 'Nanchaku', 'nanchaku', 'seedhe-maut', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop', 214, 'Delhi Hip-Hop', 2),
('ind-03', 'Big Dawgs', 'big-dawgs', 'hanumankind', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', 232, 'Southern Rap', 3),
('ind-04', 'Prarthana', 'prarthana', 'krsna', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop', 188, 'Desi Hip-Hop', 4),
('glb-01', 'Not Like Us', 'not-like-us', 'kendrick-lamar', 'https://images.unsplash.com/photo-1549834185-bd9f078a5dfe?q=80&w=800&auto=format&fit=crop', 274, 'West Coast', 1),
('glb-02', 'FE!N', 'fein', 'travis-scott', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', 191, 'Trap', 2)
ON CONFLICT (id) DO UPDATE SET
title = EXCLUDED.title,
artwork_url = EXCLUDED.artwork_url;
