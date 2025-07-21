import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

export const taskService = {
  // Récupérer toutes les tâches
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Ajouter une tâche
  async addTask(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Supprimer une tâche
  async deleteTask(id: number) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Mettre à jour une tâche
  async updateTask(id: number, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
}; 