// Публичные (anon/publishable) параметры подключения к Supabase.
// Это безопасно коммитить: ключ рассчитан на использование во фронтенде,
// доступ к данным ограничивается политиками Row Level Security на стороне Supabase.
// НИКОГДА не помещайте сюда service_role/secret key — только публичный anon/publishable key.
//
// `supabaseUrl` здесь — только документация того, какой именно проект Supabase стоит
// за прокси: приложение (SupabaseClientService) ходит не сюда напрямую, а на свой же
// домен (/supabase-proxy), см. vercel.json и proxy.conf.json. Если проект Supabase
// когда-нибудь сменится — обновить URL нужно в этих трёх местах одновременно.
export const environment = {
  production: true,
  supabaseUrl: 'https://felkaknjzpagffpsuytk.supabase.co',
  supabaseAnonKey: 'sb_publishable_gS5pdSeNE8QRLV2uMp1HwA_a98Bgv8f'
};
