-- Run in Supabase Dashboard > SQL Editor. Safe to re-run on an empty project.
create table if not exists owners(user_id uuid primary key references auth.users on delete cascade);
create or replace function is_owner() returns boolean language sql security definer stable as
$$ select exists(select 1 from owners where user_id = auth.uid()) $$;

create table if not exists site_config(
  id int primary key default 1 check (id = 1),
  start_at  timestamptz not null default '2020-10-27T18:30:00Z', -- 28 Oct 2020 00:00 IST
  reveal_at timestamptz not null default '2026-10-28T13:00:00Z', -- 28 Oct 2026 18:30 IST
  welcome_text text, final_message text,
  signature text default E'Forever Yours,\n[YOUR NAME]',
  music_path text);
create table if not exists timeline(id uuid primary key default gen_random_uuid(), sort int default 0,
  date_label text, title text, body text, quote text, photo_path text);
create table if not exists photos(id uuid primary key default gen_random_uuid(), sort int default 0,
  path text not null, caption text, taken_on text);
create table if not exists letters(id uuid primary key default gen_random_uuid(), sort int default 0, title text, body text);
create table if not exists quotes(id uuid primary key default gen_random_uuid(), sort int default 0, text text);
-- Private: passcode hash (PBKDF2) and attempt log. RLS on + NO policies = unreachable from the browser.
create table if not exists passcode(id int primary key default 1 check (id = 1), salt text, hash text);
create table if not exists attempts(id bigserial primary key, ip text, at timestamptz default now());

do $$ declare t text; begin
  foreach t in array array['owners','site_config','timeline','photos','letters','quotes','passcode','attempts'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
  -- Content is readable/writable ONLY by the owner. Visitors get content solely via the verify-passcode function.
  foreach t in array array['site_config','timeline','photos','letters','quotes'] loop
    execute format('drop policy if exists owner_all on %I', t);
    execute format('create policy owner_all on %I for all using (is_owner()) with check (is_owner())', t);
  end loop;
end $$;

insert into storage.buckets(id,name,public) values ('photos','photos',false),('music','music',false) on conflict do nothing;
drop policy if exists owner_storage on storage.objects;
create policy owner_storage on storage.objects for all
  using (bucket_id in ('photos','music') and is_owner()) with check (bucket_id in ('photos','music') and is_owner());

-- ===== Starter content (replace everything in the Admin panel) =====
insert into site_config(id,welcome_text,final_message) values (1,
$$Six years ago, on 28 October 2020, our story began.

What started as a little moment became one of the most beautiful parts of my life.

And today, I wanted to create something that belongs only to us — a little world filled with our memories, our laughter, our moments, and all the love that words sometimes cannot explain.

Just like Radha and Krishna, some connections are too beautiful to be measured by time.

This is our story.

Our memories.

Our little forever.$$,
$$Six years ago, we began a story that has become a precious part of my life.

Today, I wanted to give you something different — not just a gift, but a little place where our memories, our feelings, and our journey can live together.

Every moment we have shared has its own meaning.

Every photograph holds a memory.

Every little conversation has its own place in our story.

And every year reminds me that what matters most is not simply how much time has passed, but the moments we have made meaningful along the way.

If I could make one wish for our future, it would be for more beautiful memories, more reasons to smile, more understanding, and more moments that we can look back on with happy hearts.

May our story always carry the beauty of Radha and Krishna's timeless love, the calm of a moonlit Vrindavan, and the sweetness of a melody played on Krishna's flute.

Thank you for being part of my story.

Happy six years to us.

With all my love, always. 💙🦚$$) on conflict do nothing;

insert into timeline(sort,date_label,title,quote,body) values
(1,'28 October 2020','The Beginning','Our story began, and unknowingly, a beautiful journey started.','Replace with your real memory.'),
(2,'2021','Growing Closer','Every little conversation became a memory worth keeping.','Replace with your real memory.'),
(3,'2022','Little Moments, Big Feelings','Some of our smallest moments became some of my biggest reasons to smile.','Replace with your real memory.'),
(4,'2023','Learning Together','Through every change, we kept creating our own story.','Replace with your real memory.'),
(5,'2024','A Thousand Memories','Every photograph holds a moment, and every moment holds a piece of us.','Replace with your real memory.'),
(6,'2025','Stronger Together','Time passed, but the memories kept becoming more precious.','Replace with your real memory.'),
(7,'2026','Six Years of Us','Six years later, I would still choose the beginning, the journey, and you.','Replace with your real memory.');

insert into letters(sort,title,body) values
(1,'The Beginning',$$Sometimes I wonder how a single day can become such an important part of a lifetime.

Then I remember 28 October 2020.

That day became the beginning of a story that I still want to keep writing, one little moment at a time.

If I could go back, I would still want to experience that beginning again.$$),
(2,'What You Mean to Me','Paste Letter 2 here from the Admin panel.'),
(3,'Six Years of Us','Paste Letter 3 here from the Admin panel.'),
(4,'My Little Forever','Paste Letter 4 here from the Admin panel.');

insert into quotes(sort,text) values
(1,'Six years ago, our story began. Today, my heart still celebrates that beginning.'),
(2,'If our love were a melody, I would choose Krishna''s flute to play it forever.'),
(3,'Every peacock feather reminds me that the most beautiful things in life are often the most delicate.'),
(4,'I don''t need a perfect story. I want our real story, with all its little moments.'),
(5,'Time counts the years, but my heart remembers the moments.'),
(6,'Like Radha and Krishna, may our story always carry a little magic, a little devotion, and a lot of love.'),
(7,'28 October 2020 was the beginning. 28 October 2026 is another beautiful chapter.'),
(8,'Some dates stay on the calendar. Some stay in the heart.');

-- AFTER creating your owner user in Authentication > Users, run (with YOUR user id):
-- insert into owners(user_id) values ('PASTE-USER-UUID');
