-- Store the existing Classic and Journey profile/contact copy in the singleton.
-- Existing profile records are preserved; the seed is inserted only when absent.
begin;

alter table public.site_profile
  add column if not exists name text not null default '',
  add column if not exists hero_badge text not null default '',
  add column if not exists hero_tags jsonb not null default '[]'::jsonb,
  add column if not exists education text not null default '',
  add column if not exists focus_areas text not null default '',
  add column if not exists contact_slogans jsonb not null default '[]'::jsonb,
  add column if not exists journey_en jsonb not null default '{}'::jsonb,
  add column if not exists journey_zh jsonb not null default '{}'::jsonb;

alter table public.site_profile
  add constraint site_profile_hero_tags_array check (jsonb_typeof(hero_tags) = 'array'),
  add constraint site_profile_contact_slogans_array check (jsonb_typeof(contact_slogans) = 'array'),
  add constraint site_profile_journey_en_object check (jsonb_typeof(journey_en) = 'object'),
  add constraint site_profile_journey_zh_object check (jsonb_typeof(journey_zh) = 'object');

insert into public.site_profile (
  singleton, name, hero_badge, hero_tags, heading, intro, bio,
  location, education, focus_areas, email, github, linkedin, contact_slogans,
  journey_en, journey_zh
)
select
  true,
  'Kaius Jin',
  'Computer Science @ UWaterloo',
  '["Backend Engineering", "Cloud Infrastructure", "Full-stack Development", "AI Tools"]'::jsonb,
  'A curious mind, always on the move.',
  'I am a Computer Science student at the University of Waterloo. I enjoy turning complex backend workflows and infrastructure challenges into clear, reliable tools.',
  'My focus is backend systems, cloud infrastructure, and AI-powered applications. I am always eager to collaborate on challenging projects, co-op opportunities, and open-source work.',
  'Waterloo, Canada',
  'University of Waterloo, CS',
  'Backend / Cloud / AI Tools',
  'kaius.jin@outlook.com',
  'https://github.com/KaiusJin',
  'https://www.linkedin.com/in/kaixuan-jin/',
  '["I turn scattered signals into working systems.", "I build software that survives real users.", "I make AI feel sharp, useful, and fast.", "I connect algorithms with human problems."]'::jsonb,
  jsonb_build_object(
    'welcome_intro', 'I’m Kaius — a computer science student at Waterloo. Come along, and discover what I’ve been building.',
    'focus', 'BACKEND · CLOUD · AI',
    'heading', 'A curious mind, always on the move.',
    'intro', 'I study Computer Science at the University of Waterloo. I enjoy turning complex backend workflows and infrastructure challenges into clear, reliable tools.',
    'bio', 'My focus is backend systems, cloud infrastructure, and AI-powered applications. Outside of code, I’m interested in photography, travel, everyday moments, and music.',
    'education_school', 'University of Waterloo',
    'education_field', 'Computer Science',
    'location_detail', 'Backend · Cloud · AI',
    'contact_heading', 'Every ending is a new beginning.',
    'contact_intro', 'Have an idea, an opportunity, or a story to share? I’d love to hear from you.',
    'contact_outro', 'Thank you for traveling with me. There are always more things to learn, build, and discover.'
  ),
  jsonb_build_object(
    'welcome_intro', '我是 Kaius，滑铁卢大学计算机科学学生。一起出发，看看我一路创造的东西。',
    'focus', '后端开发 · 云基础设施 · AI',
    'heading', '怀着好奇，一直向前。',
    'intro', '我在滑铁卢大学学习计算机科学。我喜欢把复杂的后端流程和基础设施问题，转化为清晰、可靠的工具。',
    'bio', '我的方向是后端系统、云基础设施和 AI 应用。代码之外，我也喜欢摄影、旅行、日常记录与音乐。',
    'education_school', 'University of Waterloo',
    'education_field', 'Computer Science',
    'location_detail', 'Backend · Cloud · AI',
    'contact_heading', '每一次抵达，都是新的出发。',
    'contact_intro', '有新的想法、合作机会，或想分享的故事？欢迎给我写信。',
    'contact_outro', '谢谢你陪我走过这段旅程。还有更多值得学习、创造和发现的事物，等待着下一次出发。'
  )
where not exists (select 1 from public.site_profile);

commit;
