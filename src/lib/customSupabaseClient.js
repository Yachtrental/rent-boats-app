import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fawhgzqftodzlqdkqaam.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhd2hnenFmdG9kemxxZGtxYWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjYwNTUsImV4cCI6MjA3NDEwMjA1NX0.FtCOepAYJ5Vc2pSDu1Ihx47rQqqAdaNLeEFCRsHSdZU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);