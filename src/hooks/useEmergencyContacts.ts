import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string | null;
  created_at: string;
}

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: { 
    name: string; 
    phone?: string; 
    email?: string; 
    relationship?: string; 
  }) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save emergency contacts.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert({
          user_id: user.id,
          name: contact.name,
          phone: contact.phone || null,
          email: contact.email || null,
          relationship: contact.relationship || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setContacts([data, ...contacts]);
      toast({
        title: "Contact Added",
        description: `${contact.name} has been added to your emergency contacts.`,
      });
      return data;
    } catch (err: any) {
      console.error("Error adding contact:", err);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setContacts(contacts.filter(c => c.id !== id));
      toast({
        title: "Contact Removed",
        description: "Emergency contact has been removed.",
      });
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      toast({
        title: "Error",
        description: "Failed to remove contact.",
        variant: "destructive",
      });
    }
  };

  return { contacts, loading, addContact, deleteContact, refetch: fetchContacts };
}
