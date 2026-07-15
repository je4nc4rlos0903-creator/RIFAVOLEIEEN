// =====================================
// CONEXÃO SUPABASE
// =====================================


// Dados públicos do Supabase

const SUPABASE_URL =
"https://oimzoelsxwrciuvwsgjp.supabase.co";


const SUPABASE_KEY =
"sb_publishable_zMtQpqWl6yIwvZPRi_W66A_FGG-gTZA";



// Criar conexão

const supabaseClient =
window.supabase.createClient(

    SUPABASE_URL,

    SUPABASE_KEY

);
