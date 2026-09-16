// Публичные (anon/publishable) параметры подключения к Supabase.
// Это безопасно коммитить: ключ рассчитан на использование во фронтенде,
// доступ к данным ограничивается политиками Row Level Security на стороне Supabase.
// НИКОГДА не помещайте сюда service_role/secret key — только публичный anon/publishable key.
export const environment = {
  production: true,
  supabaseUrl: 'https://felkaknjzpagffpsuytk.supabase.co',
  supabaseAnonKey: 'sb_publishable_gS5pdSeNE8QRLV2uMp1HwA_a98Bgv8f'
};
