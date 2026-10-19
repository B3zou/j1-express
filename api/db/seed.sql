-- ─────────────────────────────────────────────────────────────────────────────
-- GG League · données de démo (les mêmes qu'au J0) : 5 jeux, 8 équipes de 3 joueurs, 2 agents libres.
-- Chargées par « make db-reset » après schema.sql. Les identifiants sont stables : 1, 2, 3…
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO game (name, genre, team_size) VALUES
  ('Rocket League', 'sports', 3),
  ('Valorant', 'fps', 5),
  ('League of Legends', 'moba', 5),
  ('Street Fighter 6', 'fighting', 1),
  ('Trackmania', 'racing', 1);

INSERT INTO team (name, tag, country) VALUES
  ('Null Pointers', 'NUL', 'FR'),
  ('Kernel Panic', 'KPN', 'FR'),
  ('Lag Busters', 'LAG', 'BE'),
  ('Stack Overflowers', 'STK', 'CA'),
  ('404 Not Found', '404', 'CH'),
  ('Segfault Esports', 'SEG', 'DE'),
  ('Sudo Squad', 'SDO', 'ES'),
  ('Merge Conflict', 'MRG', 'FR');

-- team_id : 1 = Null Pointers, 2 = Kernel Panic, … 8 = Merge Conflict
INSERT INTO player (nickname, country, role, rating, birth_date, team_id) VALUES
  ('Zer0Day', 'FR', 'striker', 2450, '2001-06-15', 1),
  ('Segv', 'FR', 'playmaker', 2310, '2001-06-15', 1),
  ('NaN', 'BE', 'defender', 2280, '2001-06-15', 1),
  ('Byt3', 'FR', 'striker', 2390, '2001-06-15', 2),
  ('Oops', 'FR', 'playmaker', 2205, '2001-06-15', 2),
  ('Sigkill', 'CH', 'defender', 2350, '2001-06-15', 2),
  ('Ping', 'BE', 'striker', 2150, '2001-06-15', 3),
  ('Jitter', 'BE', 'playmaker', 2080, '2001-06-15', 3),
  ('Packet', 'NL', 'defender', 2120, '2001-06-15', 3),
  ('Recursion', 'CA', 'striker', 2420, '2001-06-15', 4),
  ('Heap', 'CA', 'playmaker', 2290, '2001-06-15', 4),
  ('Frame', 'US', 'defender', 2260, '2001-06-15', 4),
  ('NotHere', 'CH', 'striker', 2190, '2001-06-15', 5),
  ('Lost', 'FR', 'playmaker', 2170, '2001-06-15', 5),
  ('Void', 'CH', 'defender', 2240, '2001-06-15', 5),
  ('Coredump', 'DE', 'striker', 2330, '2001-06-15', 6),
  ('Dangling', 'DE', 'playmaker', 2210, '2001-06-15', 6),
  ('Nullptr', 'AT', 'defender', 2300, '2001-06-15', 6),
  ('Root', 'ES', 'striker', 2270, '2001-06-15', 7),
  ('Chmod', 'ES', 'playmaker', 2140, '2001-06-15', 7),
  ('Su', 'PT', 'defender', 2160, '2001-06-15', 7),
  ('Rebase', 'FR', 'striker', 2360, '2001-06-15', 8),
  ('Cherry', 'FR', 'playmaker', 2250, '2001-06-15', 8),
  ('Blame', 'FR', 'defender', 2190, '2001-06-15', 8),
  ('Glitch', 'FR', NULL, 2210, NULL, NULL),
  ('Lagger', 'BE', NULL, 1500, NULL, NULL);
