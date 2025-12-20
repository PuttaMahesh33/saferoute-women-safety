import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { PanicButton } from "@/components/PanicButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Phone, 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  MapPin,
  Bell,
  CheckCircle,
  Loader2,
  LogIn
} from "lucide-react";
import { useEmergencyContacts } from "@/hooks/useEmergencyContacts";
import { useAuth } from "@/hooks/useAuth";

export default function PanicPage() {
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", relationship: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const { contacts, loading, addContact, deleteContact } = useEmergencyContacts();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddContact = async () => {
    if (!newContact.name || (!newContact.phone && !newContact.email)) {
      return;
    }

    const result = await addContact({
      name: newContact.name,
      phone: newContact.phone || undefined,
      email: newContact.email || undefined,
      relationship: newContact.relationship || undefined,
    });

    if (result) {
      setNewContact({ name: "", phone: "", email: "", relationship: "" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="danger-soft" className="mb-3">
            <AlertCircle className="w-3 h-3 mr-1" />
            Emergency Features
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Panic Alert System
          </h1>
          <p className="text-muted-foreground">
            Quick access to emergency alerts and contact management.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panic Button Section */}
          <div className="space-y-6">
            <Card className="border-danger/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Emergency SOS</CardTitle>
                <CardDescription>
                  Press the button below in case of emergency. Your location will be 
                  automatically shared with your emergency contacts and saved to our system.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <PanicButton size="large" />
              </CardContent>
            </Card>

            {/* What happens when pressed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Happens When Pressed?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: MapPin, text: "Your GPS location is captured instantly", active: true },
                  { icon: Users, text: "Alert sent to all emergency contacts", active: true },
                  { icon: Bell, text: "Admin dashboard receives real-time notification", active: true },
                  { icon: Shield, text: "Continuous location tracking begins", active: true },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-safe/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-safe" />
                      </div>
                      <span className="text-sm text-foreground">{item.text}</span>
                      <CheckCircle className="w-4 h-4 text-safe ml-auto" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-6">
            {/* Login prompt if not logged in */}
            {!user && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Login to Save Contacts</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign in to save your emergency contacts permanently.
                      </p>
                    </div>
                    <Button onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                    <CardDescription>
                      People who will be notified in an emergency
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={!user}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Contact Form */}
                {showAddForm && user && (
                  <Card variant="flat" className="bg-muted/50 p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Contact Name *"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      />
                      <Input
                        placeholder="Phone Number"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      />
                      <Input
                        placeholder="Email Address"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      />
                      <Input
                        placeholder="Relationship (e.g., Family, Friend)"
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="safe" 
                          size="sm" 
                          onClick={handleAddContact}
                          disabled={!newContact.name || (!newContact.phone && !newContact.email)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save Contact
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Contact List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No emergency contacts added yet.</p>
                    <p className="text-sm">
                      {user ? "Add contacts to receive alerts." : "Sign in to add contacts."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold">
                              {contact.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {contact.phone || contact.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contact.relationship && (
                            <Badge variant="secondary" className="hidden sm:flex">
                              {contact.relationship}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteContact(contact.id)}
                            className="text-muted-foreground hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Numbers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Police", number: "100", icon: Shield },
                  { name: "Women Helpline", number: "1091", icon: Phone },
                  { name: "Ambulance", number: "102", icon: Phone },
                ].map((service, i) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <a 
                        href={`tel:${service.number}`}
                        className="text-lg font-bold text-primary hover:underline"
                      >
                        {service.number}
                      </a>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
